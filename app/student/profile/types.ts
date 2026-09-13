export type UserData = {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  email_verified: boolean;
};

export type StudentProfileData = {
  user_id: string;
  student_number: string | null;
  university_id: string | null;
  university_name: string | null;
  program: string | null;
  year_of_study: number | null;
  gender: string | null;
};

export type UniversityOption = {
  id: string;
  name: string;
};
