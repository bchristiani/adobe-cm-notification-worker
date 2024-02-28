import challenge from './handlers/challenge';
import webhook from './handlers/webhook';
import { Router } from 'itty-router';

const router = Router();

router.get('/webhook', challenge);
router.post('/webhook', webhook);

router.all('*', () => new Response('404, not found!', { status: 404 }));

addEventListener('fetch', (e) => {
	e.respondWith(router.handle(e.request));
});
