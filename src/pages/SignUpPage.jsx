import React from "react";
import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        appearance={{
          elements: {
            formButtonPrimary: "bg-black hover:bg-gray-800 text-white ",
          },
        }}
      />
    </div>
  );
};

export default SignUpPage;
