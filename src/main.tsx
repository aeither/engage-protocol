import React from "react";
import ReactDOM from "react-dom/client";
import { Buffer } from 'buffer';
import process from 'process';
import App from "./App";
import "./index.css";

// Make polyfills globally available for Solana libraries
(globalThis as any).Buffer = Buffer;
(globalThis as any).process = process;
(globalThis as any).global = globalThis;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
