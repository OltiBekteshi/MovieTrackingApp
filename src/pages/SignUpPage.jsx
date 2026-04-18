import React from "react";
import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Create an account
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Join MovieTracker to track films and share with friends.
        </p>
      </div>

      <div className="clerk-auth-page rounded-2xl border border-white/10 bg-[#243030]/95 p-1 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] backdrop-blur-md">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          appearance={{
            variables: {
              colorPrimary: "#2dd4bf",
              colorText: "#f4f4f5",
              colorTextSecondary: "#a1a1aa",
              colorBackground: "#1e2a2a",
              colorInputBackground: "#0f1717",
              colorInputText: "#fafafa",
              borderRadius: "0.75rem",
            },
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none border-0",
              headerTitle: "text-white text-xl font-semibold",
              headerSubtitle: "text-gray-400",
              socialButtonsRoot: "hidden",
              dividerRow: "hidden",
              formButtonPrimary:
                "bg-teal-500 hover:bg-teal-400 text-[#0a0f0f] font-semibold shadow-none",
              formFieldLabel: "text-gray-300",
              formFieldInput:
                "bg-[#0f1717] border-white/10 text-white placeholder:text-gray-500",
              footerActionLink: "text-teal-400 hover:text-teal-300",
              footerActionText: "text-gray-400",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-teal-400",
              formFieldInputShowPasswordButton: "text-gray-400",
            },
          }}
        />
      </div>
    </div>
  );
};

export default SignUpPage;
