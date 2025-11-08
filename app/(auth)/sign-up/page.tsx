import { SignUpForm } from "@/components/auth/SignUpForm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function SignUpPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (token) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <SignUpForm />
    </div>
  );
}
