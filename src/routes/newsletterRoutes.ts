import { Router } from 'express';
import {
    getSubscribers,
    subscribeNewsletter
} from '../controllers/newsletterController';

const router = Router();

// POST /api/newsletter/subscribe — Add a new subscriber
router.post('/subscribe', subscribeNewsletter);

// GET /api/newsletter — Get all subscribers
router.get('/', getSubscribers);

export default router;
