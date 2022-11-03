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
