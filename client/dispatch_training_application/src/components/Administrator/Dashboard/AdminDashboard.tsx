import { PageHeader } from "../../Shared/PageHeader";
import AdminActionsSection from "./components/AdminActionsSections";
import AdminUsersSection from "./components/AdminUsersSection";

export default function AdminDashboard(){
return (
  <>
 <div style={{ height: '100vh', overflowY: 'auto'}}>
   <PageHeader title="Admin Dashboard" subtitle="Manage dispatchers, trainees, and training resources across the system" />
    <AdminUsersSection />
<AdminActionsSection />
 </div>
</>
)
}