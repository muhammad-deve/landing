import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { PageBackground } from "@/components/page-background";

export const metadata: Metadata = {
  title: "Dashboard — GoPort",
  description: "Your GoPort token, traffic stats, and domains.",
};

export default function DashboardPage() {
  return (
    <div className="relative z-0 flex min-h-screen flex-col">
      <PageBackground />
      <main className="relative z-10 flex-1">
        <DashboardClient />
      </main>
    </div>
  );
}
