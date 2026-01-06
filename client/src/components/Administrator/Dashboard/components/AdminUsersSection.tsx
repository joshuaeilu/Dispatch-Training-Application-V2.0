import { Card, Row, Col, Typography } from 'antd';
import {
  ArrowRightOutlined,
    CustomerServiceOutlined,
    UserSwitchOutlined,
} from '@ant-design/icons';
import {
  AcademicCapIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  ClockIcon,
  ReceiptRefundIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

            import { RightOutlined } from "@ant-design/icons";

import { useNavigate } from 'react-router-dom';

import { getUsers } from '../../../../contexts/UniversalHelpers';
const { Title, Paragraph } = Typography;


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}


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
  
    <>
    
      <div className=" px-6 py-5 sm:px-6">
      <h3 className="text-lg font-semibold text-brand-maroon">Trainee Progress</h3>
      <p className="mt-1 text-sm text-gray-500">
        Lorem ipsum dolor sit amet consectetur adipisicing elit quam corrupti consectetur.
        </p>
      </div>

        <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '0.5rem' }}>
      <Row gutter={[24, 24]}>
        {actions.map((action, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
<div className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl">
  <div className="px-4 py-5 sm:p-6">
    <div className="flex items-start justify-between gap-4">
      {/* Left: icon + text */}
      <div className="flex items-start gap-4">
        <div
          className="shrink-0"
          style={{
            backgroundColor: "rgba(140, 33, 49, 0.08)",
            width: 44,
            height: 44,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8C2131",
          }}
        >
          {action.icon}
        </div>

        <div className="min-w-0 pt-0.5">
          <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
            {action.title}
          </Title>

          <Paragraph
            style={{
              margin: 0,
              marginTop: 6,
              fontSize: 14,
              lineHeight: "20px",
              color: "#555",
            }}
          >
            {action.description}
          </Paragraph>
        </div>
      </div>


<div className="pt-1">
  <div
    className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 group-hover:translate-x-0.5"
    style={{
      backgroundColor: "rgba(140, 33, 49, 0.08)",
    }}
  >
    <ArrowRightOutlined
      className="text-[12px] transition-colors duration-200"
      style={{
        color: "#8C2131",
      }}
    />
  </div>
</div>


    </div>
  </div>
</div>

          </Col>
        ))}
      </Row>
    </div>
      
    </>
  )
}
