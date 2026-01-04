import { Card, Row, Col, Typography } from 'antd';
import {
    CustomerServiceOutlined,
    UserSwitchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { getUsers } from '../../../../contexts/UniversalHelpers';

const { Title,  Paragraph } = Typography;


export default function AdminUsersSection() {
  const navigate = useNavigate();
  const { users } = getUsers(); // assumes this fetches users
  const roleCounts = {
    dispatcher: 0,
    trainee: 0,
    admin: 0,
  };

  // Count users by role
  if (Array.isArray(users)) {
    users.forEach((u) => {
      if (roleCounts[u.role as keyof typeof roleCounts] !== undefined) {
        roleCounts[u.role as keyof typeof roleCounts]++;
      }
    });
  }

  // Actions based on counts
  const actions = [
    {
      title: 'Dispatchers',
      icon: (
        <CustomerServiceOutlined
          style={{ fontSize: 24, color: 'var(--color-primary)' }}
        />
      ),
      description: 'Manage and oversee dispatcher and activities.',
      route: '/dashboard/dispatchers',
      
    },
    {
      title: 'Trainees',
      icon: (
        <UserSwitchOutlined
          style={{ fontSize: 24, color: 'var(--color-primary)' }}
        />
      ),
      description: 'Manage and oversee trainee and activities.',
      route: '/dashboard/trainees',
    },
 
  ];

  return (
    <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '0.5rem' }}>
      <Row gutter={[24, 24]}>
        {actions.map((action, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => navigate(action.route)}
              style={{
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                cursor: 'pointer',
              }}
              className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                  style={{
                    backgroundColor: 'rgba(140, 33, 49, 0.08)',
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8C2131',
                  }}
                >
                  {action.icon}
                </div>

                <div>
                  <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                    {action.title}
                  </Title>
                  <Paragraph style={{ margin: 0, fontSize: 14, color: '#555' }}>
                    {action.description}
                  </Paragraph>
                </div>

              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
