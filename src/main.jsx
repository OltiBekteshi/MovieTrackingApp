import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.jsx";
import "./index.css";
import alTranslations from "./al.json";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkKey) {
  throw new Error(
    "Clerk publishable key is not defined in environment variables"
  );
}

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={clerkKey}
      localization={{ translations: alTranslations, locale: "sq" }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
