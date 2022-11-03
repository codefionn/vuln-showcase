/*
 * vuln-showcase - Showcasing some common web vulnerabilities
 * Copyright (C) 2022 Fionn Langhans
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
