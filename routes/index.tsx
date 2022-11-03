import { Handlers, PageProps } from "$fresh/server.ts";
import MainPage from "../components/MainPage.tsx";
import { MiddleAuthentication } from "./_middleware.ts";

interface Props {
  userId?: number;
}

export const handler: Handlers<Props, MiddleAuthentication> = {
  async GET(req, ctx) {
    return ctx.render({
      userId: ctx.state.id,
    });
  },
};

export default function Home({ data }: PageProps<Props>) {
  return (
    <MainPage
      title="Home"
      description="Home of vuln-showcase"
      cssFiles={["index"]}
      userId={data.userId}
    >
      <form method="get" action="/posts">
        <div class="flex-grow"></div>
        <h1>vuln-showcase</h1>
        <input id="search" name="q" required />
        <div class="flex-grow"></div>
      </form>
    </MainPage>
  );
}
