import { Handlers, PageProps } from "$fresh/server.ts";
import { MiddleAuthentication } from "../_middleware.ts";
import UserRepository from "../../repository/UserRepository.ts";
import { PoolClient } from "pg";
import MainPage from "../../components/MainPage.tsx";
import { redirect } from "../../utils/control.ts";
import { createJwt } from "../../utils/jwt.ts";

interface Props {
  error?: string;
  login?: string;
}

export const handler: Handlers<Props, MiddleAuthentication> = {
  async GET(req, ctx) {
    if (ctx.state.id) {
      return redirect("/user/account");
    }

    ctx.state.id = undefined;

    return ctx.render({});
  },
  async POST(req, ctx) {
    if (ctx.state.id) {
      return redirect("/user/account");
    }

    const form = await req.formData();
    const login = form.get("login");
    const password = form.get("password");
    if (!login || !password) {
      return ctx.render({
        error: "A technical error occured",
      });
    }

    const user = await (await import("../../repository/db.ts")).connectDb(
      async (dbClient: PoolClient) => {
        const userRepo = new UserRepository(dbClient);
        return await userRepo.findByEmail(login.toString());
      },
    );

    if (!user || !(await user.verifyPassword(password.toString()))) {
      return ctx.render({
        error: "Login or password are incorrected",
        login: login.toString(),
      });
    }

    // Login successfull
    ctx.state.id = user.id;

    return redirect("/user/account");
  },
};

export default function Login({ data }: PageProps<Props>) {
  return (
    <MainPage title="Login" cssFiles={["user/login"]}>
      {data.error && <div class="error">{data.error}</div>}
      <form method="post" action="/user/login">
        <label for="login">E-Mail</label>
        <input
          id="login"
          name="login"
          placeholder="user@example.org"
          value={data.login ?? ""}
          required
        />
        <label for="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <div id="register">
          <a href="/user/register">No account? Register.</a>
        </div>
      </form>
    </MainPage>
  );
}
