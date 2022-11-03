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

import { timingSafeEqual } from "std/crypto/timing_safe_equal.ts";
import { decode, encode } from "std/encoding/base64url.ts";

const key = await crypto.subtle.generateKey(
  {
    name: "HMAC",
    hash: "SHA-256",
  },
  false,
  ["sign", "verify"],
);

export async function createJwt(
  data: Record<string, unknown>,
): Promise<string> {
  const encoder = new TextEncoder();

  const jwtUnsigned = (encode(JSON.stringify({})) + "." +
    encode(JSON.stringify(data))).replace("=", "");

  const signature = encode(
    await crypto.subtle.sign(
      { name: "HMAC" },
      key,
      encoder.encode(jwtUnsigned),
    ),
  );
  return (jwtUnsigned + "." + signature).replace("=", "");
}

export async function verifyJwtInsecure(
  jwt: string,
): Promise<Record<string, unknown> | undefined> {
  try {
    const [keycontentstr, usercontentstr, usersignaturestr] = jwt.split(".", 3);
    if (!keycontentstr || !usercontentstr || !usersignaturestr) {
      return undefined;
    }

    const usercontent = JSON.parse(
      new TextDecoder().decode(decode(usercontentstr)),
    );
    if (typeof usercontent !== "object") { // Only object will be signed
      return undefined;
    }

    const serverJwt = await createJwt(usercontent);
    if (serverJwt !== jwt) { // Insecure
      return undefined;
    }

    return usercontent;
  } catch (err) { // e.g. JSON.parse can throw an SyntaxError
    console.error(err);
    return undefined;
  }
}

export async function verifyJwt(
  jwt: string,
): Promise<Record<string, unknown> | undefined> {
  try {
    const [keycontentstr, usercontentstr, usersignaturestr] = jwt.split(".", 3);
    if (!keycontentstr || !usercontentstr || !usersignaturestr) {
      return undefined;
    }

    const usercontent = JSON.parse(
      new TextDecoder().decode(decode(usercontentstr)),
    );
    if (typeof usercontent !== "object") { // Only object will be signed
      return undefined;
    }

    const serverJwt = await createJwt(usercontent);
    const encoder = new TextEncoder();
    if (!timingSafeEqual(encoder.encode(serverJwt), encoder.encode(jwt))) {
      return undefined;
    }

    return usercontent;
  } catch (err) { // e.g. JSON.parse can throw an SyntaxError
    console.error(err);
    return undefined;
  }
}
