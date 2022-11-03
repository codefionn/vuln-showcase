import { JSX } from "preact";
import { asset, Head } from "$fresh/runtime.ts";
import { Header } from "./MainPage/Header.tsx";
import { Footer } from "./MainPage/Footer.tsx";

interface DocumentProps extends JSX.ElementChildrenAttribute {
  title: string;
  description?: string;
  cssFiles?: string[];
  userId?: number;
}

export default function MainPage(props: DocumentProps) {
  const cssFiles = props.cssFiles ?? [];

  return (
    <>
      <Head>
        <title>{props.title}</title>
        <meta name="description" content={props.description ?? ""} />
        <link rel="stylesheet" href={asset("/style/style.css")} />
        {cssFiles.map((name) => (
          <link rel="stylesheet" href={asset("/style/" + name + ".css")} />
        ))}
      </Head>
      <Header userId={props.userId} />
      <main>{props.children}</main>
      <Footer />
    </>
  );
}
