import { CustomerServiceOutlined, TeamOutlined, UserAddOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { PageHeader } from '../../Shared/PageHeader';
import AdminWelcomeSection from './components/AdminWelcomeSection';
import DashboardSection from './components/DashboardSection';
import { getUser } from '../../../contexts/AuthProvider';
import { getUsers } from '../../../contexts/UniversalHelpers';
import {RecentActivitySection} from './components/RecentActivitySection';


export default function AdminDashboard() {
  const user = getUser();
  const { users } = getUsers();

  function countRoles(usersList: typeof users, role: string) {
    return usersList.filter(user => user.role === role).length;
  }


  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Monitor Training Progress and Platform Activity"
      />
      <AdminWelcomeSection avatarUrl={user?.avatar} name={user?.username} role={user?.role} stats={[
        { label: 'Dispatchers', value: countRoles(users, 'dispatcher') },
        { label: 'Trainees', value: countRoles(users, 'trainee') },
        { label: 'Administrators', value: countRoles(users, 'admin') },
      ]} />
      <div className=" flex flex-col gap-6 lg:flex-row">
      <div className="flex flex-col gap-6 lg:w-[65%] px-6 md:px-0 md:pl-6">
      <DashboardSection title='Training Progress' subtitle='Track completion, performance, and ongoing activity. ' cardsData={[{ title: 'Trainees', description: 'View and manage trainee progress', icon: <UserSwitchOutlined />, route: '/dashboard/trainees' }, { title: 'Dispatchers', description: 'Manage dispatchers and their activities', icon: <CustomerServiceOutlined />, route: '/dashboard/dispatchers' }]} />
      <DashboardSection title="User Management" subtitle="Manage users, roles, and access permissions." cardsData={[{ title: 'Create User', description: 'Add a new user to the system', icon: <UserAddOutlined />, route: '/dashboard/create-user' }, { title: 'Manage Users', description: 'Edit, View or Remove existing users', icon: <TeamOutlined />, route: '/dashboard/manage-users' }]} />
      </div>
      <div  className="flex flex-col lg:w-[35%] px-6 pb-6 md:px-0 md:pr-6">
      <RecentActivitySection />
      </div>
      </div>
    </>
  );
}