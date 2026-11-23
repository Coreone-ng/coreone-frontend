import { notFound } from "next/navigation";
import { Settings, type SettingsTab } from "@/features/dashboard/Settings";
export default async function Page({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await params;
  if (!["account", "billing", "security", "banks", "preferences"].includes(tab))
    notFound();
  return <Settings key={tab} tab={tab as SettingsTab} />;
}
