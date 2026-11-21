import { BusinessSetup } from "@/features/auth/BusinessSetup";
export const metadata = { title: "Set up your business | CoreOne" };
export default function Page() {
  return <BusinessSetup mode="business" />;
}
