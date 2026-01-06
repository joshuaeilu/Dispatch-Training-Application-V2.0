import {  useRef } from 'react';
import { CustomerServiceOutlined, TeamOutlined, UserAddOutlined, UserOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { PageHeader } from '../../Shared/PageHeader';
import AdminUsersSection from './components/AdminUsersSection';
import AdminActionsSection from './components/AdminActionsSections';
import AdminWelcomeSection from './components/AdminWelcomeSection';
import DashboardSection from './components/DashboardSection';
import { AcademicCapIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

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
          title="Dashboard"
          subtitle="Monitor Training Progress and Platform Activity"
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
        <AdminWelcomeSection />
        <DashboardSection title='Training Progress' subtitle='Track completion, performance, and ongoing activity. ' cardsData={[{title: 'Trainees', description: 'View and manage trainee progress', icon: <UserSwitchOutlined   />, route: '/dashboard/trainees'}, {title: 'Dispatchers', description: 'Manage dispatchers and their activities', icon: <CustomerServiceOutlined  />, route: '/dashboard/dispatchers'}]} />
        <DashboardSection title="User Management" subtitle="Manage users, roles, and access permissions." cardsData={[{title: 'Create User', description: 'Add a new user to the system', icon: <UserAddOutlined  />, route: '/dashboard/create-user'}, {title: 'Manage Users', description: 'Edit, View or Remove existing users', icon: <TeamOutlined />, route: '/dashboard/manage-users'}]} />
      </div>


    </div>
  );
}