export default async request => {
	console.log('Handling challenge probe')
	try {
		const url = new URL(request.url);
		const params = url.searchParams;
		if (params.get('challenge')) {
			return new Response(params.get('challenge'));
		} else {
			return new Response('No challenge', { status: 400 });
		}
	} catch (err) {
		console.error(err);
		return new Response('Unable to handle challenge.', { status: 500 });
	}
}
