import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your lessons."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-semibold text-paper link-grow">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
