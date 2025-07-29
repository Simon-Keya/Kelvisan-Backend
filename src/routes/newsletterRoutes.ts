import { Router } from 'express';
import {
    getSubscribers // Use the more specific name from the controller
    ,
    subscribeNewsletter,
    unsubscribeFromNewsletter
} from '../controllers/newsletterController';

const router = Router();

// POST /api/newsletter/subscribe — Add a new subscriber
router.post('/subscribe', subscribeNewsletter);

// DELETE /api/newsletter/unsubscribe — Remove a subscriber by email
router.delete('/unsubscribe', unsubscribeFromNewsletter);

// GET /api/newsletter/subscribers — Get all subscribers (typically admin-only)
// Changed the path to '/subscribers' for better RESTful naming,
// as the root '/' might be used for other purposes or just for general info.
router.get('/subscribers', getSubscribers);

export default router;