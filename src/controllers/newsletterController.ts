import { Request, Response } from 'express';
import { addSubscriber, getAllSubscribers } from '../models/newsletterModel';

// POST /api/newsletter
export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    res.status(400).json({ message: 'Valid email is required.' });
    return;
  }

  try {
    await addSubscriber(email);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err: unknown) { // Use 'unknown' for better type safety
    console.error('Error in subscribeNewsletter:', err); // <--- ADD THIS MORE DETAILED LOGGING
    // Check if err is an Error instance to get its message
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    res.status(500).json({ message: 'Subscription failed', error: errorMessage }); // <--- Send specific message
  }
};

// GET /api/newsletter
export const getSubscribers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const subscribers = await getAllSubscribers();
    res.status(200).json(subscribers);
  } catch (err: unknown) { // Use 'unknown' for better type safety
    console.error('Error in getSubscribers:', err); // <--- ADD THIS MORE DETAILED LOGGING
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    res.status(500).json({ message: 'Failed to fetch subscribers', error: errorMessage });
  }
};
