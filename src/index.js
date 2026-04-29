import React from "react";
import ReactDOM from "react-dom/client";
import { Luminar } from "./Luminar";

const rootElement = document.getElementById("root");

// Ensure the #root element exists
if (!rootElement) {
  throw new Error("Root element not found. Make sure your index.html has <div id='root'></div>");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Luminar />
  </React.StrictMode>
);
