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
