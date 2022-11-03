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
