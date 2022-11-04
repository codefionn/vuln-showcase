#!/usr/bin/env -S deno run --unstable --allow-hrtime --allow-net=localhost:8000

if (Deno.args.length !== 1) {
  console.log("Expected [login]");
  Deno.exit(1);
}

const doesNotExistsEmail = "thisemaildoesnotexist@thisdomaindoesnotexist";

async function measureLoginTime(login: string): Promise<number> {
  const start = performance.now();

  const form = new FormData();
  form.append("login", login);
  form.append("password", "password-test");

  await fetch("http://localhost:8000/user/login", {
    method: "post",
    body: form,
    redirect: "error",
    headers: {
      accept: "text/html",
      referer: "http://localhost:8000/user/login",
    },
  });

  //console.log(await resp.text());

  return performance.now() - start;
}

await measureLoginTime(doesNotExistsEmail);

const doesNotExistTime = await measureLoginTime(doesNotExistsEmail);
const maybeExistsTime = await measureLoginTime(Deno.args[0]);

if (doesNotExistTime + 10 < maybeExistsTime) {
  console.log(`The login ${Deno.args[0]} does maybe exist`);
  Deno.exit(0);
} else {
  console.error(`The login ${Deno.args[0]} does maybe not exist`);
  Deno.exit(1);
}
