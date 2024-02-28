import { notifyTeams } from '../utils/teams';
import { diffInMinutes, toTimeString } from '../utils/date';
import {
	getExecution,
	getPipelineExecutionUrl,
	getStepState,
	getStepStates,
	REL_EXECUTION,
	REL_SELF
} from '../utils/cloud-manager';

export default async request => {
	console.log('Handling incoming event');
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
				const status = `**Status:** ${execution.status} | **Trigger:** ${execution.trigger} | **Created At:** ${toTimeString(createdDate)}`;
				const title = 'Pipeline - started';
				console.log(title);
				await notifyTeams(title, status, execution.pipeline.name, execution.program.name, getStepStates(execution), getPipelineExecutionUrl(execution, REL_SELF));
			} else if (ENDED === eventType && EXECUTION_PIPELINE === eventObjType) {
				const execution = await getExecution(eventObjUrl);
				const createdDate = new Date(execution.createdAt);
				const finishedDate = new Date(execution.finishedAt);
				const status = `**Status:** ${execution.status} | **Trigger:** ${execution.trigger} | **Created At:** ${toTimeString(createdDate)} | **Finished At:** ${toTimeString(finishedDate)} | **Duration:** ${diffInMinutes(finishedDate, createdDate)} minutes`;
				const title = 'Pipeline - ended';
				console.log(title);
				await notifyTeams(title, status, execution.pipeline.name, execution.program.name, getStepStates(execution), getPipelineExecutionUrl(execution, REL_SELF));
			} else if (STARTED === eventType && EXECUTION_STEP === eventObjType) {
				const stepState = await getStepState(eventObjUrl);
				const startedDate = new Date(stepState.startedAt);
				const status = `**Status:** ${stepState.status} | **Started At:** ${toTimeString(startedDate)}`;
				const title = `Execution Step > ${stepState.action} - started`;
				console.log(title);
				await notifyTeams(title, status, stepState.pipeline.name, stepState.program.name, getStepStates(stepState.execution), getPipelineExecutionUrl(stepState, REL_EXECUTION));
			} else if (ENDED === eventType && EXECUTION_STEP === eventObjType) {
				const stepState = await getStepState(eventObjUrl);
				const startedDate = new Date(stepState.startedAt);
				const finishedDate = new Date(stepState.finishedAt);
				const status = `**Status:** ${stepState.status} | **Started At:** ${toTimeString(startedDate)} | **Finished At:** ${toTimeString(finishedDate)}`;
				const title = `Execution Step > ${stepState.action} - ended`;
				console.log(title);
				await notifyTeams(title, status, stepState.pipeline.name, stepState.program.name, getStepStates(stepState.execution), getPipelineExecutionUrl(stepState, REL_EXECUTION));
			} else if (WAITING === eventType && EXECUTION_STEP === eventObjType) {
				const stepState = await getStepState(eventObjUrl);
				const startedDate = new Date(stepState.startedAt);
				const status = `**Status:** ${stepState.status} | **Started At:** ${toTimeString(startedDate)}`;
				const title = `Execution Step > ${stepState.action} - waiting`;
				console.log(title);
				await notifyTeams(title, status, stepState.pipeline.name, stepState.program.name, getStepStates(stepState.execution), getPipelineExecutionUrl(stepState, REL_EXECUTION));
			} else {
				console.warn('Received unexpected event');
			}
			return new Response('pong');
		}
	} catch (err) {
		console.error(err);
		return new Response('Unable to handle webhook.', { status: 500 });
	}
}


