import { PageHeader } from "../../Shared/PageHeader";
import AdminActionsSection from "./components/AdminActionsSections";
import AdminUsersSection from "./components/AdminUsersSection";

export default function AdminDashboard() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Fixed Header */}
      <div style={{ flex: '0 0' }}>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage dispatchers, trainees, and training resources across the system"
        />
      </div>

      {/* Scrollable Section */}
      <div style={{ flex: '1 1', overflowY: 'auto', paddingBottom: 24 }}>
        <AdminUsersSection />
        <AdminActionsSection />
      </div>
    </div>
  );
}
