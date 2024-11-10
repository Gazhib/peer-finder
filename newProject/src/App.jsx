import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./AppLayout";
import HomePage from "./Pages/Home/Home";
import AuthPage, { action as authAction } from "./Pages/Auth/Auth";
import { Provider } from "react-redux";
import { store, persistor } from "../store";
import InterestPage from "./Pages/Interest/Interest";
import { PersistGate } from "redux-persist/integration/react";
import Matches from "./Pages/Matches/Matches";
export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      children: [
        {
          index: 1,
          element: <HomePage />,
        },
        {
          path: "/auth",
          element: <AuthPage />,
          action: authAction,
        },
        {
          path: "/user/:user",
          element: <InterestPage />,
        },
        {
          path: "/find",
          element: <Matches />,
        },
      ],
    },
  ]);
  return (
    
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  );
}
