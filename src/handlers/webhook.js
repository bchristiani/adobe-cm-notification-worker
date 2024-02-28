import { notifyTeams } from '../utils/teams';
import { diffInMinutes, toTimeString } from '../utils/date';
import {
	getPipelineExecution,
	getPipelineExecutionUrl,
	getStepStateExecution,
	getStepStates,
	REL_EXECUTION,
	REL_SELF
} from '../utils/cloud-manager';

export default async request => {
	try {
		const body = await request.text();
		const { recipient_client_id, event } = JSON.parse(body);
		if (CLIENT_ID !== recipient_client_id) {
			console.warn(`Unexpected client id ${recipient_client_id}`);
			return new Response('Bad Request', {status: 400});
		} else {
			const STARTED = 'https://ns.adobe.com/experience/cloudmanager/event/started';
			const ENDED = 'https://ns.adobe.com/experience/cloudmanager/event/ended';
			const WAITING = 'https://ns.adobe.com/experience/cloudmanager/event/waiting';
			const EXECUTION_PIPELINE = 'https://ns.adobe.com/experience/cloudmanager/pipeline-execution';
			const EXECUTION_STEP = 'https://ns.adobe.com/experience/cloudmanager/execution-step-state';

			const eventType = event['@type'];
			const eventObjType = event['xdmEventEnvelope:objectType'];
			const executionUrl = event['activitystreams:object']['@id'];

			if (STARTED === eventType && EXECUTION_PIPELINE === eventObjType) {
				await getPipelineExecution(executionUrl).then(execution => {
					const createdDate = new Date(execution.createdAt);
					const status = `**Status:** ${execution.status} | **Trigger:** ${execution.trigger} | **Created At:** ${toTimeString(createdDate)}`;
					const title = "Pipeline - started";
					console.log(title);
					notifyTeams(title, status, execution.pipeline.name, execution.program.name, getStepStates(execution), getPipelineExecutionUrl(execution, REL_SELF));
				})
			} else if (ENDED === eventType && EXECUTION_PIPELINE === eventObjType) {
				await getPipelineExecution(executionUrl).then(execution => {
					const createdDate = new Date(execution.createdAt);
					const finishedDate = new Date(execution.finishedAt);
					const status = `**Status:** ${execution.status} | **Trigger:** ${execution.trigger} | **Created At:** ${toTimeString(createdDate)} | **Finished At:** ${toTimeString(finishedDate)} | **Duration:** ${diffInMinutes(finishedDate, createdDate)} minutes`;
					const title = "Pipeline - ended";
					console.log(title);
					notifyTeams(title, status, execution.pipeline.name, execution.program.name, getStepStates(execution), getPipelineExecutionUrl(execution, REL_SELF));
				})
			} else if (STARTED === eventType && EXECUTION_STEP === eventObjType) {
				await getStepStateExecution(executionUrl).then(execution => {
					const startedDate = new Date(execution.startedAt);
					const status = `**Status:** ${execution.status} | **Started At:** ${toTimeString(startedDate)}`;
					const title = `Execution Step > ${execution.action} - started`;
					console.log(title);
					notifyTeams(title, status, execution.pipeline.name, execution.program.name, getStepStates(execution.execution), getPipelineExecutionUrl(execution, REL_EXECUTION));
				})
			} else if (ENDED === event['@type'] && EXECUTION_STEP === eventObjType) {
				await getStepStateExecution(executionUrl).then(execution => {
					const startedDate = new Date(execution.startedAt);
					const finishedDate = new Date(execution.finishedAt);
					const status = `**Status:** ${execution.status} | **Started At:** ${toTimeString(startedDate)} | **Finished At:** ${toTimeString(finishedDate)}`;
					const title = `Execution Step > ${execution.action} - ended`;
					console.log(title);
					notifyTeams(title, status, execution.pipeline.name, execution.program.name, getStepStates(execution.execution), getPipelineExecutionUrl(execution, REL_EXECUTION));
				});
			} else if (WAITING === eventType && EXECUTION_STEP === eventObjType) {
				await getStepStateExecution(executionUrl).then(execution => {
					const startedDate = new Date(execution.startedAt);
					const status = `**Status:** ${execution.status} | **Started At:** ${toTimeString(startedDate)}`;
					const title = `Execution Step > ${execution.action} - waiting`;
					console.log(title);
					notifyTeams(title, status, execution.pipeline.name, execution.program.name, getStepStates(execution.execution), getPipelineExecutionUrl(execution, REL_EXECUTION));
				})
			} else {
				console.warn('Unexpected event received');
			}
			return new Response('pong');
		}
	} catch (err) {
		return new Response('Unable to handle webhook.', { status: 500 });
	}
}


