export async function notifyTeams(title, status, pipeline, program, steps, cmExecutionDetailsLink) {
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
					'activityTitle': '**Execution Steps:**',
					'facts': steps
				}
			],
			'potentialAction': [
				{
					'@type': 'OpenUri',
					'name': 'View Details in Cloud Manager',
					'targets': [
						{
							'os': 'default',
							'uri': cmExecutionDetailsLink
						}
					]
				}
			]
		})
	});
	if (response.status !== 200) {
		const body = await response.text();
		console.error(`Notifying Teams has failed with status code ${response.status}: ${body}`);
	}
}
