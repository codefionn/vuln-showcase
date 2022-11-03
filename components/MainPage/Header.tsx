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
      <a href="/" title="Go To Homepage">
        <div>vuln-showcase</div>
      </a>
      <div class="flex-grow"></div>
      {!props.userId && <ShowNotLoggedIn />}
      {props.userId && <ShowLoggedIn userId={props.userId} />}
    </header>
  );
}
