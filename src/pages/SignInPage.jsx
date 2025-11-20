import React from "react";
import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            formButtonPrimary: "bg-black hover:bg-gray-800 text-white ",
          },
        }}
      />
    </div>
  );
};

export default SignInPage;
