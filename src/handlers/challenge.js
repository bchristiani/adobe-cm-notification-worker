export default async request => {
	try {
		const url = new URL(request.url);
		const params = url.searchParams;
		if (params.get('challenge')) {
			return new Response(params.get('challenge'));
		} else {
			return new Response('No challenge', { status: 400 });
		}
	} catch (err) {
		return new Response('Unable to handle challenge.', { status: 500 });
	}
}
