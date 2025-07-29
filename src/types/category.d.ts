export interface Category {
    id: string; // Category IDs are now UUIDs (strings)
    name: string;
    description?: string | null;
    created_at: Date;
    updated_at: Date;
  }