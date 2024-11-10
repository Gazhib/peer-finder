import { Link } from "react-router-dom";
import style from "./Header.module.css";
import { useSelector } from "react-redux";
export default function Header() {
  const isLogged = useSelector((state) => state.user.email);
  return (
    <header>
      <Link to={"/"} className={style.logo}>
        peer finder
      </Link>
      <nav>
        <Link to={"/"}>Home</Link>
        <Link to={"/find"}>find kent</Link>
        {isLogged ? (
          <Link to={`/user/${isLogged}`}> Account </Link>
        ) : (
          <Link to={"/auth?mode=login"}>sign in</Link>
        )}
      </nav>
    </header>
  );
}
