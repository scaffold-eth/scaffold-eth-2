export type UserRecord = {
  id: number;
  address: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  profilePicture: string | null;
  points: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserPayload = {
  address: string;
  name?: string;
  email?: string;
  bio?: string;
  profilePicture?: string;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  bio?: string;
  profilePicture?: string;
};
