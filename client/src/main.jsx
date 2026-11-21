import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { ConfirmProvider } from "./context/ConfirmContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ConfirmProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </ConfirmProvider>
          <Toaster
            position="bottom-right"
            gutter={8}
            toastOptions={{
              duration: 3000,
              className: "!bg-surface !text-ink !border !border-line !shadow-pop !text-sm !rounded-lg",
              success: { iconTheme: { primary: "rgb(var(--status-done))", secondary: "#fff" } },
              error: { iconTheme: { primary: "rgb(var(--primary))", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
