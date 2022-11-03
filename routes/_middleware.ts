import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { assert } from "https://deno.land/std@0.150.0/_util/assert.ts";
import { createJwt, verifyJwt } from "../utils/jwt.ts";

export interface MiddleAuthentication {
  id?: number;
}

function parseCookieHeader(cookie?: string): Map<string, string> {
  if (!cookie) {
    return new Map();
  }

  return cookie.split("; ", 3).map((keyWithValue) => {
    const [key, value] = keyWithValue.split("=", 2);
    if (!key || !value) {
      return undefined;
    }

    return [key, value];
  }).filter((value) => typeof value !== "undefined").reduce((rhs, lhs) => {
    assert(lhs?.length === 2);

    rhs.set(lhs[0], lhs[1]);
    return rhs;
  }, new Map<string, string>());
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<MiddleAuthentication>,
) {
  const cookies = parseCookieHeader(req.headers.get("Cookie") ?? undefined);
  let cookieAuth = cookies.get("AUTH");
  const oldId = ctx.state.id;
  if (cookieAuth) {
    const userdata = await verifyJwt(cookieAuth);
    if (userdata && typeof userdata.id === "number") {
      ctx.state.id = userdata.id;
    } else {
      cookieAuth = undefined;
    }
  }

  const resp = await ctx.next();
  if (ctx.state.id && (!cookieAuth || oldId !== ctx.state.id)) {
    resp.headers.append(
      "Set-Cookie",
      [
        "AUTH=" + await createJwt({ id: ctx.state.id }),
        "Path=/",
        "SameSite=Strict",
        "Secure",
        "HttpOnly",
      ].join("; "),
    );
  } else if (cookieAuth && !ctx.state.id) {
    resp.headers.append(
      "Set-Cookie",
      ["AUTH=", "Path=/"].join("; "),
    );
  } else if (cookieAuth && ctx.state.id) {
    resp.headers.append(
      "Cookie",
      "AUTH=" + cookieAuth,
    );
  }

  return resp;
}
