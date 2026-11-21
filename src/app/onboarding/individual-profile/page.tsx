import { BusinessSetup } from "@/features/auth/BusinessSetup";
export const metadata = { title: "Set up your profile | CoreOne" };
export default function Page() {
  return <BusinessSetup mode="individual" />;
}
