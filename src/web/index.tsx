import React from "react";
import { createRoot } from "react-dom/client";
import { Web3Provider } from "./contexts/Web3Context";
import IdentityDashboard from "./components/IdentityDashboard";
import "./styles/globals.css";

const App = () => {
  return (
    <Web3Provider>
      <IdentityDashboard />
    </Web3Provider>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
