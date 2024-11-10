import { Link } from "react-router-dom";
import style from "./Home.module.css";
import { useSelector } from "react-redux";

export default function HomePage() {
  const username = useSelector((state) => state.user.username);

  return (
    <>
      <div className={style.container}>
        <main>
          <h2 className={style.main_title}>
            The way to improve
            <br />
            Your student life is to find
            <br />
            like-minded students
          </h2>
          <Link to={username ? "/find" : "/auth"} className={style.cta_button}>
            GET STARTED!
          </Link>
          <div className={style.instructions}>
            <p>Instructions:</p>
            <p>
              <Link to={username ? `/user/${username}` : "/auth"}>
                Press this button
              </Link>
            </p>
            <p>sign in if you did not</p>
          </div>
        </main>
      </div>
    </>
  );
}
