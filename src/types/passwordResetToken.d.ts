export interface PasswordResetToken {
    id: string; // UUID of the token record
    admin_id: string; // UUID of the admin associated with this token
    token: string; // The actual unique token string sent to the user
    expires_at: Date; // When this token becomes invalid
    used: boolean; // Flag to indicate if the token has been used
    created_at: Date;
    updated_at: Date;
  }