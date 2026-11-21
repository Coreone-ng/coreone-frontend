import { BusinessSetup } from "@/features/auth/BusinessSetup";
export const metadata = { title: "Choose your account type | CoreOne" };
export default function Page() {
  return <BusinessSetup mode="choose" />;
}
