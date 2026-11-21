import { AuthPage } from "@/features/auth/AuthPage";

export const metadata = { title: "Set up your account | CoreOne" };
export default function Page() {
  return <AuthPage mode="setup" />;
}
