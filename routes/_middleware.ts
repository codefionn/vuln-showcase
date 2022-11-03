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

import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { assert } from "https://deno.land/std@0.150.0/_util/assert.ts";
import { redirect } from "../utils/control.ts";
import { createJwt, verifyJwt, verifyJwtInsecure } from "../utils/jwt.ts";

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
  if (req.body) {
    // Is a post request => Validate referer
    const referer = req.headers.get("Referer");
    if (!referer) {
      return redirect("/"); // Don't let it through
    }

    const urlReferer = new URL(referer);
    const url = new URL(req.url);

    if (urlReferer.host !== url.host) {
      return redirect("/"); // Don't let it through
    }
  }

  const cookies = parseCookieHeader(req.headers.get("Cookie") ?? undefined);
  let cookieAuth = cookies.get("AUTH");
  const oldId = ctx.state.id;
  if (cookieAuth) {
    const userdata = await verifyJwtInsecure(cookieAuth);
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
