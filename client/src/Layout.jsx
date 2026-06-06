import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Components/Header.jsx";
import Footer from "./components/Footer.jsx";

function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between transition-colors duration-300">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Layout;