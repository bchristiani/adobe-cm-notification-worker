export const notifyTeams = (title, status, pipeline, program, steps, pipelineUrl) => {
	return fetch(TEAMS_WEBHOOK, {
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
					'facts': steps,
				},
				{
					'activityTitle': 'View pipeline in Cloud Manager (requires cloud manager access)'
				}
			],
			'potentialAction': [
				{
					'@type':'OpenUri',
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
	})
}
