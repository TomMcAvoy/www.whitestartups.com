import Link from "next/link";
import RefreshTokenHandler from "./RefreshTokenHandler";

export default function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/profile">Profile</Link>
          </li>
          <li>
            <Link href="/settings">Settings</Link>
          </li>
        </ul>
      </nav>
      <RefreshTokenHandler />
    </header>
  );
}
