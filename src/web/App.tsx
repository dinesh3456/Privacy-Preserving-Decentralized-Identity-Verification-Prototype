import React from "react";
import { createRoot } from "react-dom/client";
import { Web3Provider } from "./contexts/Web3Context";
import IdentityDashboard from "./components/IdentityDashboard";

function App() {
  return (
    <Web3Provider>
      <div className="app">
        <IdentityDashboard />
      </div>
    </Web3Provider>
  );
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");
const root = createRoot(container);
root.render(<App />);
