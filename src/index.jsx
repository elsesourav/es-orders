import React from "react";
import { createRoot } from "react-dom/client";
import IndexPage from "./IndexPage.jsx";
import "./index.css";

const container = document.getElementById("options-root");
const root = createRoot(container);

root.render(
   <React.StrictMode>
      <IndexPage />
   </React.StrictMode>
);
