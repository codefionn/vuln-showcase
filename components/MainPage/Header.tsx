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

import Icon from "../MaterialDesignIcon.tsx";

export interface HeaderProps {
  userId?: number;
}

function ShowNotLoggedIn() {
  return (
    <div>
      <a href="/user/login" title="Login">
        <Icon fileName="account_circle" alt="Login" />
      </a>
    </div>
  );
}

function ShowLoggedIn(props: HeaderProps) {
  return (
    <div>
      <a href="/user/account" title="Account">
        <Icon fileName="account_circle" alt="Account" />
      </a>
      <a href="/user/logout" title="Logout">
        <Icon fileName="logout" alt="Logout" />
      </a>
    </div>
  );
}

export function Header(props: HeaderProps) {
  return (
    <header>
      <div>
        <a href="/" title="Go To Homepage">
          <div>vuln-showcase</div>
        </a>
        <div class="flex-grow"></div>
        {!props.userId && <ShowNotLoggedIn />}
        {props.userId && <ShowLoggedIn userId={props.userId} />}
      </div>
      <div class="seperator"></div>
    </header>
  );
}
