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
import { timingSafeEqual } from "std/crypto/timing_safe_equal.ts";
import { encode } from "std/encoding/base64url.ts";

const HASH_SALT = "this-is-my-awesome-salt";

export async function hashPassword(cleartextPassword: string): Promise<string> {
  const encoder = new TextEncoder();

  return encode(hash(
    encoder.encode(cleartextPassword),
    encoder.encode(HASH_SALT),
  ));
}

export async function verifyPasswordInsecure(
  cleartextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  const hashedCleartextPassword = await hashPassword(cleartextPassword);

  return hashedCleartextPassword === hashedPassword; // That's insecure
}

export async function verifyPassword(
  cleartextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const hashedCleartextPassword = await hashPassword(cleartextPassword);

  return timingSafeEqual(
    encoder.encode(hashedCleartextPassword),
    encoder.encode(hashedPassword),
  );
}
