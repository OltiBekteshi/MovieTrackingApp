import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const SignInPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1a2222] pt-20 pb-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.12),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto flex w-full max-w-md flex-col px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to save watchlists, rate films, and connect with friends.
          </p>
        </div>

        <div className="clerk-auth-page rounded-2xl border border-white/10 bg-[#243030]/95 p-1 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] backdrop-blur-md">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
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

        <p className="mt-8 text-center text-sm text-gray-500">
          <Link
            to="/movies"
            className="font-medium text-teal-400/90 hover:text-teal-300"
          >
            ← Back to movies
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
