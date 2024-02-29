let accessToken;

async function getAccessToken () {
	console.log("Obtaining access token");
	const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
		'method': 'POST',
		'headers': {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		'body': new URLSearchParams({
			'grant_type': 'client_credentials',
			'client_id': CLIENT_ID,
			'client_secret': CLIENT_SECRET,
			'scope': 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,read_pc.dma_aem_ams'
		})
	});
	return response.ok && response.json();
}

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
	if (!accessToken) {
		const accessTokenResponse = await getAccessToken();
		if (accessTokenResponse && accessTokenResponse.access_token) {
			accessToken = accessTokenResponse.access_token;
		} else {
			console.error('Could not obtain access token');
		}
	}
	const response = await fetch(url, {
		'method': method,
		'headers': {
			'x-gw-ims-org-id': ORGANIZATION_ID,
			'x-api-key': CLIENT_ID,
			'Authorization': `Bearer ${accessToken}`
		}
	});
	return response.json();
}

export async function getExecution(executionUrl) {
	const execution = await makeApiCall(executionUrl, 'GET');

	const programLink = getLink(execution, REL_PROGRAM);
	const programUrl = new URL(programLink, executionUrl);
	execution.program = await makeApiCall(programUrl, 'GET');

	const pipelineLink = getLink(execution, REL_PIPELINE);
	const pipelineUrl = new URL(pipelineLink, executionUrl);
	execution.pipeline = await makeApiCall(pipelineUrl, 'GET');

	return execution;
}

export async function getStepState(stepStateUrl) {
	const stepState = await getExecution(stepStateUrl);

	const executionLink = getLink(stepState, REL_EXECUTION);
	const executionUrl = new URL(executionLink, stepStateUrl);
	stepState.execution = await makeApiCall(executionUrl, 'GET');

	return stepState;
}
