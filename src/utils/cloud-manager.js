export const REL_PROGRAM = 'http://ns.adobe.com/adobecloud/rel/program';
export const REL_PIPELINE = 'http://ns.adobe.com/adobecloud/rel/pipeline';
export const REL_EXECUTION = 'http://ns.adobe.com/adobecloud/rel/execution';
export const REL_SELF = 'self';

export const getStepStates = (obj) => {
	const steps = [];
	obj['_embedded'].stepStates.forEach(function(step) {
		steps.push({ 'name': `- ${step.action}:`, 'value': step.status });
	});
	return steps;
};

export const getLink = (obj, linkType) => {
	return obj['_links'][linkType].href;
};

export const getPipelineExecutionUrl = (obj, linkType) => {
	const pipelineExecutionPath = getLink(obj, linkType).replace('/api', '');
	return CM_PIPELINE_EXECUTION_BASE_URL + pipelineExecutionPath;
};

export async function makeApiCall(url, method) {
	const response = await fetch(url, {
		'method': method,
		'headers': {
			'x-gw-ims-org-id': ORGANIZATION_ID,
			'x-api-key': CLIENT_ID,
			'Authorization': `Bearer ${ACCESS_TOKEN}`
		}
	});
	return response.json();
}

export async function getPipelineExecution(executionUrl) {
	const execution = await makeApiCall(executionUrl, 'GET');

	const programLink = getLink(execution, REL_PROGRAM);
	const programUrl = new URL(programLink, executionUrl);
	execution.program = await makeApiCall(programUrl, 'GET');

	const pipelineLink = getLink(execution, REL_PIPELINE);
	const pipelineUrl = new URL(pipelineLink, executionUrl);
	execution.pipeline = await makeApiCall(pipelineUrl, 'GET');

	return execution;
}

export async function getStepStateExecution(stepStateUrl) {
	const stepStateExecution = await makeApiCall(stepStateUrl, 'GET');

	const programLink = getLink(stepStateExecution, REL_PROGRAM);
	const programUrl = new URL(programLink, stepStateUrl);
	stepStateExecution.program = await makeApiCall(programUrl, 'GET');

	const pipelineLink = getLink(stepStateExecution, REL_PIPELINE);
	const pipelineUrl = new URL(pipelineLink, stepStateUrl);
	stepStateExecution.pipeline = await makeApiCall(pipelineUrl, 'GET');

	const executionLink = getLink(stepStateExecution, REL_EXECUTION);
	const executionUrl = new URL(executionLink, stepStateUrl);
	stepStateExecution.execution = await makeApiCall(executionUrl, 'GET');

	return stepStateExecution;
}