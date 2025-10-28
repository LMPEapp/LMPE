import { User } from "./user.model";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginRequestOut {
  token: string;
  refreshToken: string;
  user?: User;
}

export interface RefreshTokenIN {
  RefreshToken: string;
}

export interface ChangePasswordRequest{
  UserId:number;
  OldPassword:string;
  NewPassword:string;
}
