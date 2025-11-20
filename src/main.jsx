import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.jsx";
import "./index.css";
import alTranslations from "./al.json";
// import { frFR } from "@clerk/localizations";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkKey) {
  throw new Error(
    "Clerk publishable key is not defined in environment variables"
  );
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
