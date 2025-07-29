export interface Subscriber {
    id: number; // SERIAL
    email: string;
    subscribed_at: Date; // Knex's timestamps(true, true) adds created_at/updated_at, but your migration uses subscribed_at
  }