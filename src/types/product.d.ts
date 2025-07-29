// Define the structure of a Product as it appears in the database
export interface Product {
    id: string; // Changed from number to string (UUID)
    name: string;
    image_url: string; // Changed from 'image' to 'image_url' to match migration
    description: string;
    price: number;
    category_id?: string | null; // Changed from number to string (UUID for category)
    category_name?: string | null; // For joined queries (not in DB, but returned by select)
    created_at: Date; // Not optional, as Knex's timestamps(true, true) makes it non-nullable
    updated_at: Date; // Added, as Knex's timestamps(true, true) includes this
  }