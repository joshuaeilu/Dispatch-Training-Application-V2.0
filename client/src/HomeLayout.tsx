import React, { useContext, useEffect, useMemo, useState } from 'react';
import {  LogoutOutlined, MenuOutlined} from '@ant-design/icons';
import { Button, Drawer, Grid, Layout, Menu, Typography, } from 'antd';
import { Outlet } from 'react-router-dom';
import CSLOGO from './assets/cs_logo.png';
import type { Role } from './types/index.types';
import { AuthContext } from './contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
const { Header, Content,  Sider } = Layout;

import { Toaster } from 'react-hot-toast';
import type { MenuItem } from './types/index.types';
import { MENU_BY_ROLE } from './data/data';

const App: React.FC = () => {

  // Check if the screen is mobile
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md; // true for <768px

  const { logout, user,  } = useContext(AuthContext);
  const [selectedKey, setSelectedKey] = useState("");
  const role = user?.role as Role;
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Build menu items once per role change
  const roleItems = useMemo<MenuItem[]>(() => {
    return MENU_BY_ROLE[role];
  }, [role]);

  
  // Highlight selected menu item on mount.

  const pathname = window.location.pathname;
  useEffect(() => {
    // Find matching menu item for current path
    const matchedItem = roleItems.find(item => pathname.startsWith(item.key));
    if (matchedItem) {
      setSelectedKey(matchedItem.key);
    }
  }, [pathname, roleItems]);








  return (
    <Layout style={{ height: '100vh' }}>
      <Toaster position="top-center" />
{!isMobile && (
   <Sider
   collapsible
   collapsed={collapsed}
   onCollapse={(value) => setCollapsed(value)}
  theme="light"
  breakpoint="lg"
  width={250}
>
  {/* Flex column wrapper */}
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      
      paddingTop: "24px",
      paddingRight: "4px",
      paddingLeft: "4px",
      
    }}
  >

    
    {/* Top section */}
    <div style={{ textAlign: 'center', marginBottom: 16, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",}}>
      <img
        src={CSLOGO}
        alt="Calvin Logo"
        style={{
          height: 64,
          marginBottom: 16,
          filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))",
        }}
      />
      {!collapsed && (
        <Typography.Title level={4} style={{ margin: 0 }}>
        Dispatch Training Application
      </Typography.Title>
      )}
    </div>

    <Menu
      mode="inline"
      selectedKeys={[selectedKey]} 
      items={roleItems}
      style={{ flex: 1, borderRight: 0 }}
      onClick={({ key }) => {
        navigate(key);
        setSelectedKey(key);

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
      {!collapsed && 'Logout'}
    </Button>
 </div>
  </div>
</Sider>
)}
      <Layout>
        {isMobile && (
  <>
<Header
  style={{
    position: "fixed",
    zIndex: 10,
    width: "100%",
    background: "#fff",
    padding: "0 16px",
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }}
>
  {/* Left side - Title */}
  <Typography.Title
    level={3}
    style={{
      margin: 0,
      fontWeight: 600,
    }}
  >
    Dispatch Training
  </Typography.Title>

  {/* Right side - Menu Button */}
  <Button
    type="text"
    icon={
      <MenuOutlined
        style={{
          color: "#fff",
          scale: 1.5,
        }}
      />
    }
    onClick={() => setDrawerOpen(true)}
    style={{
      backgroundColor: "#8C2131",
      borderRadius: 12,
      width: 44,
      height: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "all 0.25s ease-in-out",
      margin: 0, // ensures perfect centering
    }}
  />
</Header>



    <Drawer
      placement="left"
      closable={false}
      onClose={() => setDrawerOpen(false)}
      open={drawerOpen}
      width={300}
      bodyStyle={{ padding: 0 }}
    >
      {/* Move your sidebar content inside here */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          paddingTop: "24px",
          paddingRight: "4px",
          paddingLeft: "4px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 16,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={CSLOGO}
            alt="Calvin Logo"
            style={{
              height: 64,
              marginBottom: 16,
              filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))",
            }}
          />
          <Typography.Title level={3} style={{ margin: 0 }}>
            Dispatch Training Application
          </Typography.Title>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={roleItems}
          style={{ flex: 1, borderRight: 0, fontSize: 16 }}
          onClick={({ key }) => {
            navigate(key);
            setSelectedKey(key);
            setDrawerOpen(false); // close menu when clicked
          }}
        />

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "center",
            paddingBottom: 16,
          }}
        >
          <Button
            icon={<LogoutOutlined />}
            type="primary"
            onClick={logout}
            style={{ width: "80%" }}
          >
            Logout
          </Button>
        </div>
      </div>
    </Drawer>
  </>
)}


        <Content style={{ margin: 0, padding: 0, paddingTop: isMobile ? 64 : 0, overflow: 'auto' }}>
          <Outlet />
        </Content>

      </Layout>
    </Layout>
  );
};

export default App;