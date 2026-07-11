import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { RotationGuard } from "./components/RotationGuard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RotationGuard>
      <App />
    </RotationGuard>
  </StrictMode>
);