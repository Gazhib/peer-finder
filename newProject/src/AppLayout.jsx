import { Outlet } from "react-router-dom";
import Header from "./Components/Header/Header";
export default function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
