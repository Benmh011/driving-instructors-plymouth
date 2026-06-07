import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Create an account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const defaultRole = role === "instructor" ? "INSTRUCTOR" : "LEARNER";

  return (
    <AuthShell
      title="Create your account"
      subtitle="Learners and instructors both start here."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-paper link-grow">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm defaultRole={defaultRole} />
    </AuthShell>
  );
}
