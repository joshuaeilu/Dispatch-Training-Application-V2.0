import { Card, Row, Col, Typography } from 'antd';
import {
    UserAddOutlined,
    SettingOutlined,
    MailOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const actions = [
    {
        title: 'Create User',
        description: 'Add a new trainee or dispatcher to the system.',
        icon: <UserAddOutlined style={{ fontSize: 32, color: 'var(--color-primary)' }} />,
        route: '/dashboard/create-user',
    },
    {
        title: 'Manage Users',
        description: 'Edit, delete, or view all registered users.',
        icon: <SettingOutlined style={{ fontSize: 32, color: 'var(--color-primary)' }} />,
        route: '/dashboard/manage-users',
    },
   
];

export default function AdminActionsSection() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '2rem' }}>
            <Title level={3} style={{ color: 'var(--color-text-primary)', marginBottom: '2rem' }}>
                Management Tools
            </Title>

            <Row gutter={[24, 24]}>
                {actions.map((action, index) => (
                    <Col key={index} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            onClick={() => navigate(action.route)}                            
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.transform = 'translateY(-4px)';
                                el.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.transform = 'translateY(0)';
                                el.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.05)';
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {action.icon}
                                <Title level={5} style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                                    {action.title}
                                </Title>
                                <Text style={{ color: 'var(--color-text-secondary)' }}>{action.description}</Text>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
