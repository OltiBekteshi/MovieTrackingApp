import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const location = useLocation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const backgroundLocation = location.state?.backgroundLocation;

  const getRedirectPath = () => {
    if (!backgroundLocation) return "/movies";
    return `${backgroundLocation.pathname}${backgroundLocation.search || ""}${
      backgroundLocation.hash || ""
    }`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: identifier.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate(getRedirectPath(), { replace: true });
      } else {
        setErrorMessage("Sign in needs an extra step. Please try again.");
      }
    } catch (error) {
      const firstError = error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message;
      setErrorMessage(firstError || "Invalid username/email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Sign in to save watchlists, rate films, and connect with friends.
        </p>
      </div>

      <div className="clerk-auth-page rounded-2xl border border-white/10 bg-[#243030]/95 p-1 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl p-5">
          <div className="space-y-1.5">
            <label className="text-sm text-gray-300" htmlFor="identifier">
              Username or email
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              className="w-full rounded-xl border border-white/10 bg-[#0f1717] px-3 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/60"
              placeholder="Enter username or email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-[#0f1717] px-3 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/60"
              placeholder="Enter password"
              required
            />
          </div>

          {errorMessage && (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={!isLoaded || isSubmitting}
            className="w-full rounded-xl bg-teal-500 px-4 py-2.5 font-semibold text-[#0a0f0f] transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/sign-up"
              state={{ backgroundLocation: backgroundLocation || { pathname: "/movies" } }}
              className="text-teal-400 hover:text-teal-300"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
