import { WorkspaceProvider } from "@/features/dashboard/WorkspaceProvider";
import { DashboardShell } from "@/features/dashboard/DashboardShell";
export const metadata = { title: "Workspace | CoreOne" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <DashboardShell>{children}</DashboardShell>
    </WorkspaceProvider>
  );
}
