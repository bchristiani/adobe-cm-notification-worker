import { notifyTeams } from '../utils/teams';
import { diffInMinutes, toTimeString } from '../utils/date';
import {
	getExecution,
	getCloudManagerExecutionDetailsLink,
	getStepStateExecution,
	getStepStates,
	REL_EXECUTION,
	REL_SELF
} from '../utils/cloud-manager';

async function sendNotification(title, status, pipelineName, programName, stepStates, cmExecutionDetailsLink) {
	console.log(`${title} for Pipeline [${pipelineName}] and Program [${programName}]`);
	await notifyTeams(title, status, pipelineName, programName, stepStates, cmExecutionDetailsLink);
}

export default async request => {
	try {
		const body = await request.text();
		const { recipient_client_id, event } = JSON.parse(body);
		if (CLIENT_ID !== recipient_client_id) {
			console.warn(`Unexpected client id ${recipient_client_id}`);
			return new Response('Bad Request', { status: 400 });
		} else {
			const STARTED = 'https://ns.adobe.com/experience/cloudmanager/event/started';
			const ENDED = 'https://ns.adobe.com/experience/cloudmanager/event/ended';
			const WAITING = 'https://ns.adobe.com/experience/cloudmanager/event/waiting';
			const EXECUTION_PIPELINE = 'https://ns.adobe.com/experience/cloudmanager/pipeline-execution';
			const EXECUTION_STEP = 'https://ns.adobe.com/experience/cloudmanager/execution-step-state';

			const eventType = event['@type'];
			const eventObjType = event['xdmEventEnvelope:objectType'];
			const eventObjUrl = event['activitystreams:object']['@id'];

			if (STARTED === eventType && EXECUTION_PIPELINE === eventObjType) {
				const execution = await getExecution(eventObjUrl);
				const createdDate = new Date(execution.createdAt);
				const status = `**Status:** ${execution.status} - **Trigger:** ${execution.trigger} - **Created:** ${toTimeString(createdDate)}`;
				const title = 'Pipeline Execution Started';
				await sendNotification(title, status, execution.pipeline.name, execution.program.name, getStepStates(execution), getCloudManagerExecutionDetailsLink(execution, REL_SELF));
			} else if (ENDED === eventType && EXECUTION_PIPELINE === eventObjType) {
				const execution = await getExecution(eventObjUrl);
				const createdDate = new Date(execution.createdAt);
				const finishedDate = new Date(execution.finishedAt);
				const status = `**Status:** ${execution.status} - **Trigger:** ${execution.trigger} - **Created:** ${toTimeString(createdDate)} - **Finished:** ${toTimeString(finishedDate)} - **Duration:** ${diffInMinutes(finishedDate, createdDate)} minutes`;
				const title = 'Pipeline Execution Ended';
				await sendNotification(title, status, execution.pipeline.name, execution.program.name, getStepStates(execution), getCloudManagerExecutionDetailsLink(execution, REL_SELF));
			} else if (STARTED === eventType && EXECUTION_STEP === eventObjType) {
				const stepState = await getStepStateExecution(eventObjUrl);
				const startedDate = new Date(stepState.startedAt);
				const status = `**Status:** ${stepState.status} - **Started:** ${toTimeString(startedDate)}`;
				const title = `[${stepState.action}] Execution Step Started`;
				await sendNotification(title, status, stepState.pipeline.name, stepState.program.name, getStepStates(stepState.execution), getCloudManagerExecutionDetailsLink(stepState, REL_EXECUTION));
			} else if (ENDED === eventType && EXECUTION_STEP === eventObjType) {
				const stepState = await getStepStateExecution(eventObjUrl);
				const startedDate = new Date(stepState.startedAt);
				const finishedDate = new Date(stepState.finishedAt);
				const status = `**Status:** ${stepState.status} - **Started:** ${toTimeString(startedDate)} - **Finished:** ${toTimeString(finishedDate)}`;
				const title = `[${stepState.action}] Execution Step Ended`;
				await sendNotification(title, status, stepState.pipeline.name, stepState.program.name, getStepStates(stepState.execution), getCloudManagerExecutionDetailsLink(stepState, REL_EXECUTION));
			} else if (WAITING === eventType && EXECUTION_STEP === eventObjType) {
				const stepState = await getStepStateExecution(eventObjUrl);
				const startedDate = new Date(stepState.startedAt);
				const status = `**Status:** ${stepState.status} - **Started:** ${toTimeString(startedDate)}`;
				const title = `[${stepState.action}] Execution Step Waiting`;
				await sendNotification(title, status, stepState.pipeline.name, stepState.program.name, getStepStates(stepState.execution), getCloudManagerExecutionDetailsLink(stepState, REL_EXECUTION));
			} else {
				console.warn('Received unexpected event');
			}
			return new Response('pong');
		}
	} catch (err) {
		const errorMsg = 'Unable to handle webhook';
		console.error(`${errorMsg} => ${err.message}`);
		return new Response(errorMsg, { status: 500 });
	}
}


