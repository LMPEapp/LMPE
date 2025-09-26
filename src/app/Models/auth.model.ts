import { User } from "./user.model";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginRequestOut {
  token: string;
  user?: User;
}
export interface ChangePasswordRequest{
  UserId:number;
  OldPassword:string;
  NewPassword:string;
}
