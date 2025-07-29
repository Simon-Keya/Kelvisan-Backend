export interface LoginAttempt {
    id: number; // SERIAL
    email: string;
    success: boolean;
    attempted_at: Date; // TIMESTAMP WITH TIME ZONE
  }