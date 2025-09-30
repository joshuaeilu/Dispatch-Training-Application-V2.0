import React, { useContext, useMemo } from 'react';
import { ApartmentOutlined, AppstoreFilled, FileTextOutlined, LogoutOutlined, QuestionCircleFilled, QuestionCircleOutlined, UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Button, Grid, Layout, Menu, Typography, } from 'antd';
import { Outlet } from 'react-router-dom';
import CSLOGO from './assets/cs_logo.png';
import type { Role } from './types/index.types';
import { AuthContext } from './contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;

import { Toaster } from 'react-hot-toast';
import { UniversalContext } from './contexts/UniversalHelpers';

type MenuItem = {
  key: string;            // use route path
  icon?: React.ReactNode;
  label: string;
};

const MENU_BY_ROLE: Record<Role, MenuItem[]> = {
  admin: [
    { key: '/', icon: <AppstoreFilled />, label: 'Dashboard' },
    { key: '/resources', icon: <FileTextOutlined />, label: 'Resources' },
    { key: '/knowledge-check', icon: <QuestionCircleOutlined />, label: 'Knowledge Checks' },
    { key: '/scenario-manager', icon: <ApartmentOutlined />, label: 'Scenario Manager' },
    { key: '/video-walkthroughs', icon: <VideoCameraOutlined />, label: 'Video Walkthroughs' },
  ],
  dispatcher: [
    { key: '/dashboard', icon: <UserOutlined />, label: 'Dashboard' },
    { key: '/video-walkthroughs', icon: <VideoCameraOutlined />, label: 'Video Walkthroughs' },
    { key: '/reports', icon: <UploadOutlined />, label: 'Reports' },
    { key: '/settings', icon: <UserOutlined />, label: 'Settings' },
  ],
  trainee: [
    { key: '/dashboard', icon: <UserOutlined />, label: 'Dashboard' },
    { key: '/my-exercises', icon: <VideoCameraOutlined />, label: 'My Exercises' },
    { key: '/knowledge-check', icon: <QuestionCircleFilled />, label: 'Knowledge Checks' },
    { key: '/resources', icon: <UserOutlined />, label: 'Resources' },
  ],
};

const App: React.FC = () => {

  // Check if the screen is mobile
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md; // true for <768px

  const { logout, user, token,  } = useContext(AuthContext);
  const { selectedKey, setSelectedKey } = useContext(UniversalContext);
  const role = user?.role as Role;
  const navigate = useNavigate();

  // Build menu items once per role change
  const roleItems = useMemo<MenuItem[]>(() => {
    return MENU_BY_ROLE[role];
  }, [role]);









  return (
    <Layout style={{ height: '100vh' }}>
      <Toaster position="top-center" />

   <Sider
  theme="light"
  breakpoint="lg"
  collapsedWidth="0"
  width={250}
  style={{
    height: '100%',
    padding: '16px 0 16px 0px',
  }}
>
  {/* Flex column wrapper */}
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}
  >

    
    {/* Top section */}
    <div style={{ textAlign: 'center', marginBottom: 16 }}>
      <img
        src={CSLOGO}
        alt="Calvin Logo"
        style={{
          height: 64,
          marginBottom: 8,
          filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))",
        }}
      />
      <Typography.Title level={4} style={{ margin: 0 }}>
        Dispatch Training Application
      </Typography.Title>
    </div>

    <Menu
      mode="inline"
      selectedKeys={[selectedKey]} // highlight first item by default
      items={roleItems}
      onClick={({ key }) => {
        navigate(key);
        setSelectedKey(key);
        sessionStorage.setItem('selectedKey', key);
      }}
    />

   

    {/* Bottom logout button */}
 <div 
       style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }} // now this works ✅
>
     <Button
      icon={<LogoutOutlined />}
      type='primary'
      onClick={logout}
      style={{ width: isMobile ? '90%' : '80%' }}
    >
      Logout
    </Button>
 </div>
  </div>
</Sider>

      <Layout>
        {isMobile && <Header style={{ padding: 0 }} />}

        <Content style={{ margin: 0, padding: 0 }}>
          <Outlet />
        </Content>

      </Layout>
    </Layout>
  );
};

export default App;