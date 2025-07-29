import { Request, Response } from 'express';
import NewsletterModel from '../models/newsletterModel'; // Import the default exported instance

// POST /api/newsletter/subscribe
export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || !email.includes('@')) { // Basic email validation
    res.status(400).json({ message: 'Valid email is required.' });
    return;
  }

  try {
    // Call method on the imported instance
    const newSubscriber = await NewsletterModel.addSubscriber(email);
    res.status(201).json({ message: 'Subscribed successfully!', subscriber: newSubscriber });
  } catch (err: unknown) {
    console.error('Error in subscribeNewsletter:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';

    // Check for specific error messages from the model (e.g., unique constraint violation)
    if (errorMessage.includes('Email is already subscribed')) {
      res.status(409).json({ message: errorMessage }); // 409 Conflict
    } else {
      res.status(500).json({ message: 'Subscription failed', error: errorMessage });
    }
  }
};

// GET /api/newsletter/subscribers (Admin-only route, typically)
export const getSubscribers = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Call method on the imported instance
    const subscribers = await NewsletterModel.getAllSubscribers();
    res.status(200).json(subscribers);
  } catch (err: unknown) {
    console.error('Error in getSubscribers:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    res.status(500).json({ message: 'Failed to fetch subscribers', error: errorMessage });
  }
};

// DELETE /api/newsletter/unsubscribe
// This can take email in body or ID in params, depending on your design.
// Using email in body for simplicity, as it's common for unsubscribe links.
export const unsubscribeFromNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body; // Or req.params.id if you want to use ID for admin actions

    if (!email) {
      res.status(400).json({ message: 'Email is required for unsubscription.' });
      return;
    }

    const deletedRows = await NewsletterModel.removeSubscriberByEmail(email); // Call method on the imported instance

    if (deletedRows === 0) {
      res.status(404).json({ message: 'Email not found in subscriber list.' });
      return;
    }

    res.status(200).json({ message: 'Unsubscribed successfully.' });
  } catch (err: unknown) {
    console.error('Error unsubscribing from newsletter:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    res.status(500).json({ message: 'Failed to unsubscribe.', error: errorMessage });
  }
};