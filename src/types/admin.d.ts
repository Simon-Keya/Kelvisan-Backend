export interface Admin {
    id: string; // Assuming UUID from migration
    email: string;
    username?: string; // Add if you have a username for admins
    password_hash: string; // Matches the column name in migration
    created_at: Date;
    updated_at: Date;
  }