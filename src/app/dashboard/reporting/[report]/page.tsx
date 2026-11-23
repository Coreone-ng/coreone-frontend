import { notFound } from "next/navigation";
import { ReportingDetail } from "@/features/dashboard/Reporting";
import {
  reportDefinitions,
  type ReportId,
} from "@/features/dashboard/report-model";
export default async function Page({
  params,
}: {
  params: Promise<{ report: string }>;
}) {
  const { report } = await params;
  if (
    !reportDefinitions.some(
      (item) => item.id === report && item.id !== "bank-activity",
    )
  )
    notFound();
  return <ReportingDetail key={report} id={report as ReportId} />;
}
