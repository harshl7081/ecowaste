import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp appearance={{
        elements: {
          formButtonPrimary: 
            "bg-black hover:bg-gray-800 text-sm normal-case",
          footerActionLink: "text-black hover:text-gray-800",
        },
      }} />
    </div>
  );
} 