import { SignInForm } from "@/components/auth/SignInForm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function SignInPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (token) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <SignInForm />
    </div>
  );
}
