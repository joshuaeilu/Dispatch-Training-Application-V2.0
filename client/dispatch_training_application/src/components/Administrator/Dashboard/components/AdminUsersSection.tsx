import { Card, Row, Col, Typography, Tag } from 'antd';
import {
    CustomerServiceOutlined,
    UserSwitchOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const actions = [
    {
        title: 'Dispatchers',
        icon: <CustomerServiceOutlined style={{ fontSize: 24, color: 'var(--color-primary)' }} />,
        description: 'Manage and oversee dispatcher and activities.',
        route: '/dashboard/dispatchers',
    },
    {
        title: 'Trainees',
        icon: <UserSwitchOutlined style={{ fontSize: 24, color: 'var(--color-primary)' }} />,
        description: 'Manage and oversee trainee and activities.',
        route: '/dashboard/trainees',
    },
     {
        title: 'Admins',
        icon: <SafetyCertificateOutlined style={{ fontSize: 24, color: 'var(--color-primary)' }} />,
        description: 'Manage and oversee admin accounts and activities.',
        route: '/dashboard/admins',
    },

   
];

export default function AdminUsersSection() {
    const navigate = useNavigate();

    return (
        <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
     
            <Row gutter={[24, 24]}>
                {actions.map((action, index) => (
                    <Col key={index} xs={24} sm={12} md={8} lg={6}>
                      <Card
      hoverable
      onClick={() => navigate(action.route)}
      style={{
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        cursor: "pointer",
      }}
     className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl"

    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Icon */}
        <div
          style={{
            backgroundColor: "rgba(140, 33, 49, 0.08)",
            width: 40,
            height: 40,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8C2131",
          }}
        >
          {action.icon}
        </div>

        {/* Title & Description */}
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
            {action.title}
          </Title>
          <Paragraph style={{ margin: 0, fontSize: 14, color: "#555" }}>
            {action.description}
          </Paragraph>
        </div>

        {/* Status Badge */}
        
          <Tag
            color="rgba(140, 33, 49, 0.1)"
            style={{
              color: "#8C2131",
              fontWeight: 500,
              borderRadius: 6,
              width: "fit-content",
              padding: "2px 10px",
              marginTop: 4,
            }}
          >
            {23} active
          </Tag>
      </div>
    </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
