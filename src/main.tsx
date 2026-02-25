import React from "react";
import ReactDOM from "react-dom/client";
import { LudoApp } from "./LudoApp"; // or "./ludo/LudoApp" depending where you placed it

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LudoApp />
  </React.StrictMode>
);