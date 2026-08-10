import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ProprietarioProvider } from "./context/ProprietarioContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ProprietarioProvider>
        <App />
      </ProprietarioProvider>
    </BrowserRouter>
  </StrictMode>
);
