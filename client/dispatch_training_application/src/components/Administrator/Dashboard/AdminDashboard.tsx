import {  useRef } from 'react';
import { PageHeader } from '../../Shared/PageHeader';
import AdminUsersSection from './components/AdminUsersSection';
import AdminActionsSection from './components/AdminActionsSections';

export default function AdminDashboard() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden', 
        position: 'relative' 
      }}
    >
      {/* Fixed Header */}
      <div style={{ flex: '0 0' }}>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage dispatchers, trainees, and training resources across the system"
        />
      </div>

      {/* Scrollable Section */}
      <div 
        ref={scrollContainerRef}
        style={{ 
          flex: '1 1', 
          overflowY: 'auto', 
          paddingBottom: 24 
        }}
      >
        <AdminUsersSection />
        <AdminActionsSection />
      </div>


    </div>
  );
}