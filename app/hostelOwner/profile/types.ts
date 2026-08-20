export type UserData = {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  email_verified: boolean;
};

export type VerificationData = {
  status: string;
};
