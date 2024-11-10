import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useActionData } from "react-router-dom";
import style from "./Auth.module.css";
import AuthForm from "../../Components/AuthForm/AuthForm";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../../../store";
export default function AuthPage() {
  const isLogged = useSelector((state) => state.user.username);
  const [searchParams] = useSearchParams();
  const isLogin = searchParams.get("mode") === "login";
  const [errorText, setErrorText] = useState("");
  const actionData = useActionData();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    if (isLogged) {
      navigate("/");
    }
    if (actionData && !actionData.success) {
      setErrorText(actionData.message);
    }
    if (actionData && actionData.success) {
      dispatch(userActions.getInfo(actionData.userData));
      console.log(actionData);
    }
  }, [actionData, dispatch, isLogged, navigate]);
  return (
    <div className={style.AuthPage}>
      <div className={style.register_container}>
        <h2>{isLogin ? "Log in" : "Register your account"}</h2>
        <Link to={`/auth?mode=${isLogin ? "registration" : "login"}`}>
          <p>
            {isLogin
              ? "Do not have an account?"
              : "Do you already have an account?"}
          </p>
        </Link>
        <AuthForm isLogin={isLogin} />
        <h3 className={style.errorText}>{errorText}</h3>
      </div>
    </div>
  );
}

export async function action({ request }) {
  const searchParams = new URL(request.url).searchParams;
  const fd = await request.formData();
  let data;
  const isLogin = searchParams.get("mode") === "login";
  if (isLogin) {
    data = {
      email: fd.get("email"),
      password: fd.get("password"),
    };
  } else {
    data = {
      email: fd.get("email"),
      password: fd.get("password"),
      username: fd.get("username"),
      confirmPassword: fd.get("confirmPassword"),
    };
  }

  const response = await fetch(
    `http://localhost:3000/api/${isLogin ? "login" : "registration"}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (response.status === 400) {
    return {
      success: false,
      message: await response.json(),
    };
  }
  if (response.status === 401) {
    return {
      success: false,
      message: await response.json(),
    };
  }
  if (response.status === 404) {
    return {
      success: false,
      message: await response.json(),
    };
  }
  if (response.status === 409) {
    return { success: false, message: await response.json() };
  }

  const userData = await response.json();

  return { success: true, userData };
}
