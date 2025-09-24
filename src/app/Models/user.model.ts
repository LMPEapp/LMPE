export interface User {
  id: number;
  email: string;
  pseudo: string;
  passwordHash: string;
  urlImage?: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface UserIn {
  email: string;
  pseudo: string;
  passwordHash: string;
  urlImage?: string;
  isAdmin?: boolean;
}
