import { hash } from "argon2";
import { encode } from "std/encoding/base64url.ts";

export const HASH_SALT = "this-is-my-awesome-salt";

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
    const encoder = new TextEncoder();
    this.hashedPassword = encode(
      hash(
        encoder.encode(cleartextPassword),
        encoder.encode(HASH_SALT),
      ),
    );
  }

  public async verifyPassword(cleartextPassword: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const hashedPassword = encode(
      hash(encoder.encode(cleartextPassword), encoder.encode(HASH_SALT)),
    );

    // This is insecure
    return this.hashedPassword === hashedPassword;
  }
}
