import { hash } from "argon2";
import { encode } from "std/encoding/base64url.ts";
import { hashPassword, verifyPasswordInsecure } from "../utils/password.ts";

export interface InsertUser {
  email: string;
  name: string;
  surname: string;
  cleartextPassword: string;
}

export interface LikeUser {
  id: number;
  email: string;
  name: string;
  surname: string;
  hashedPassword: string;
  isActive: boolean;
}

export class User implements LikeUser {
  public id: number;
  public email: string;
  public name: string;
  public surname: string;
  public hashedPassword: string;
  public isActive: boolean;

  public constructor(
    id: number,
    email: string,
    name: string,
    surname: string,
    hashedPassword: string,
    isActive: boolean,
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.surname = surname;
    this.hashedPassword = hashedPassword;
    this.isActive = isActive;
  }

  public async setPassword(cleartextPassword: string): Promise<void> {
    this.hashedPassword = await hashPassword(cleartextPassword);
  }

  public async verifyPassword(cleartextPassword: string): Promise<boolean> {
    return verifyPasswordInsecure(cleartextPassword, this.hashedPassword);
  }
}
