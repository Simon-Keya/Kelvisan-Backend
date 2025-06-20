import { Request, Response } from 'express';
import { addSubscriber, getAllSubscribers } from '../models/newsletterModel';

// POST /api/newsletter/subscribe
export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    res.status(400).json({ message: 'Valid email is required.' });
    return;
  }

  try {
    await addSubscriber(email);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Subscription failed', error: err });
  }
};

// GET /api/newsletter
export const getSubscribers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const subscribers = await getAllSubscribers();
    res.status(200).json(subscribers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subscribers', error: err });
  }
};
