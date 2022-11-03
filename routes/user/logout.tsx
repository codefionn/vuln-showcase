import { Handlers } from "$fresh/server.ts";
import { MiddleAuthentication } from "../_middleware.ts";
import { redirect } from "../../utils/control.ts";
import MainPage from "../../components/MainPage.tsx";

export const handler: Handlers<null, MiddleAuthentication> = {
  async GET(req, ctx) {
    if (!ctx.state.id) {
      return redirect("/");
    }

    ctx.state.id = undefined;

    return ctx.render();
  },
};

export default function Logout() {
  return (
    <MainPage title="Logged out">
      Logged out
    </MainPage>
  );
}
