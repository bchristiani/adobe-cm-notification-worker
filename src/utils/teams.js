export async function notifyTeams(title, status, pipeline, program, steps, pipelineUrl) {
	const response = await fetch(TEAMS_WEBHOOK, {
		'method': 'POST',
		'headers': { 'Content-Type': 'application/json' },
		'body': JSON.stringify({
			'@context': 'https://schema.org/extensions',
			'@type': 'MessageCard',
			'title': title,
			'summary': title,
			'sections': [
				{
					'activityTitle': status
				},
				{
					'facts': [
						{
							'name': 'Pipeline:',
							'value': pipeline
						},
						{
							'name': 'Program:',
							'value': program
						}
					]
				},
				{
					'activityTitle': '**Summary Steps:**',
					'facts': steps
				},
				{
					'activityTitle': 'View pipeline in Cloud Manager (requires cloud manager access)'
				}
			],
			'potentialAction': [
				{
					'@type': 'OpenUri',
					'name': 'Pipeline Details',
					'targets': [
						{
							'os': 'default',
							'uri': pipelineUrl
						}
					]
				}
			]
		})
	});
	const body = await response.text();
	if (response.status === 200) {
		console.log('Notifying Teams was successful.');
	} else {
		console.error(`Notifying Teams has failed with status code ${response.status}: ${body}`);
	}
}
