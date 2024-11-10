/* eslint-disable react/prop-types */
import { Form, useNavigation } from "react-router-dom";
export default function AuthForm({ isLogin }) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  return (
    <Form method="post">
      {!isLogin && (
        <>
          <label>Username</label>
          <input type="text" name="username" placeholder="Username" />
        </>
      )}

      <label>Enter your email (nu.edu.kz)</label>
      <input
        type="email"
        name="email"
        placeholder="Enter your email (nu.edu.kz)"
      />

      <label>Password</label>
      <input type="password" name="password" placeholder="Password" />

      {!isLogin && (
        <>
          <label>Confirm your password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
          />
        </>
      )}

      <button disabled={isSubmitting} type="submit">
        {isSubmitting
          ? "Submitting..."
          : `${isLogin ? "Log in" : "Registration"}`}
      </button>
    </Form>
  );
}
