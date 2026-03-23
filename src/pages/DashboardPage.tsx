import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { CsvUpload } from "@/components/dashboard/CsvUpload";
import { CallHistory } from "@/components/dashboard/CallHistory";
import { AnalyticsView } from "@/components/dashboard/AnalyticsView";
import SettingsView from "@/pages/SettingsView";

const tabConfig: Record<string, { title: string; subtitle: string }> = {
  overview: { title: "Dashboard", subtitle: "Your revenue recovery at a glance" },
  leads: { title: "Leads", subtitle: "Manage and track your leads" },
  calls: { title: "Call History", subtitle: "Recent AI call activity" },
  analytics: { title: "Analytics", subtitle: "Performance metrics and insights" },
  upload: { title: "Upload Leads", subtitle: "Import leads from CSV" },
  settings: { title: "Settings", subtitle: "Configure your account and AI calling" },
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const config = tabConfig[activeTab] || tabConfig.overview;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={config.title} subtitle={config.subtitle} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <StatsCards />
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LeadsTable />
                </div>
                <div>
                  <CallHistory />
                </div>
              </div>
            </div>
          )}

          {activeTab === "leads" && <LeadsTable />}

          {activeTab === "calls" && (
            <div className="max-w-3xl">
              <CallHistory />
            </div>
          )}

          {activeTab === "analytics" && <AnalyticsView />}

          {activeTab === "upload" && (
            <div className="max-w-2xl">
              <CsvUpload onUploadComplete={() => setActiveTab("leads")} />
            </div>
          )}

          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
