import { Subscriber } from '../types/subscriber'; // Import the Subscriber type
import db from './db'; // Import the Knex instance

class NewsletterModel {
  private tableName = 'newsletter'; // Your newsletter table name

  /**
   * Fetches all subscribers from the database.
   * @returns A promise that resolves to an array of Subscriber objects.
   */
  async getAllSubscribers(): Promise<Subscriber[]> {
    try {
      const subscribers = await db<Subscriber>(this.tableName)
        .select('*')
        .orderBy('subscribed_at', 'desc');
      return subscribers;
    } catch (error) {
      console.error('Error fetching all subscribers:', error);
      throw new Error('Failed to retrieve subscribers.');
    }
  }

  /**
   * Fetches a subscriber by their email address.
   * @param email The email of the subscriber to find.
   * @returns A promise that resolves to a Subscriber object or null if not found.
   */
  async getSubscriberByEmail(email: string): Promise<Subscriber | null> {
    try {
      const subscriber = await db<Subscriber>(this.tableName).where({ email }).first();
      return subscriber || null;
    } catch (error) {
      console.error(`Error fetching subscriber by email (${email}):`, error);
      throw new Error(`Failed to retrieve subscriber with email ${email}.`);
    }
  }

  /**
   * Adds a new subscriber to the newsletter.
   * @param email The email address to subscribe.
   * @returns A promise that resolves to the newly created Subscriber object.
   */
  async addSubscriber(email: string): Promise<Subscriber> {
    try {
      // Assuming 'subscribed_at' is handled by the database default (CURRENT_TIMESTAMP)
      // or you can explicitly set it: subscribed_at: db.fn.now()
      const [newSubscriber] = await db<Subscriber>(this.tableName).insert({ email }).returning('*');
      return newSubscriber;
    } catch (error: any) {
      // Handle unique constraint violation (e.g., email already exists)
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new Error('Email is already subscribed.');
      }
      console.error('Error adding subscriber:', error);
      throw new Error('Failed to add subscriber.');
    }
  }

  /**
   * Removes a subscriber from the newsletter by email.
   * @param email The email address to unsubscribe.
   * @returns A promise that resolves to the number of deleted rows (1 if successful, 0 if not found).
   */
  async removeSubscriberByEmail(email: string): Promise<number> {
    try {
      const deletedRows = await db(this.tableName).where({ email }).del();
      return deletedRows;
    } catch (error) {
      console.error(`Error unsubscribing email (${email}):`, error);
      throw new Error('Failed to unsubscribe.');
    }
  }

  /**
   * Removes a subscriber from the newsletter by ID.
   * This is useful for admin panels or if you pass IDs around.
   * @param id The ID of the subscriber to remove.
   * @returns A promise that resolves to the number of deleted rows.
   */
  async removeSubscriberById(id: number): Promise<number> {
    try {
      const deletedRows = await db(this.tableName).where({ id }).del();
      return deletedRows;
    } catch (error) {
      console.error(`Error removing subscriber by ID (${id}):`, error);
      throw new Error('Failed to remove subscriber.');
    }
  }
}

export default new NewsletterModel(); // Export an instance of the model