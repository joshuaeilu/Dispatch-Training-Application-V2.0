import { Card, Row, Col, Typography } from "antd";
import {
  UserAddOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const actions = [
  {
    title: "Create User",
    description: "Add a new trainee or dispatcher to the system.",
    icon: <UserAddOutlined />,
    route: "/dashboard/create-user",
  },
  {
    title: "Manage Users",
    description: "Edit, delete, or view all registered users.",
    icon: <SettingOutlined />,
    route: "/dashboard/manage-users",
  },
];

export default function AdminActionsSection() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Section header with icon */}
    
        <div>
          <Title level={3} style={{ margin: "0 1.5rem 1.5rem 0"}}>
            Management Tools
          </Title>
         
        </div>
      {/* Cards */}
      <Row gutter={[24, 24]}>
        {actions.map((action, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => navigate(action.route)}
              style={{
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
                   className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl"

              bodyStyle={{ padding: 0 }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Icon badge */}
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
            fontSize: 24,
          }}
        >
          {action.icon}
        </div>

                {/* Text content */}
                <div>
                  <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                    {action.title}
                  </Title>
                  <Paragraph style={{ fontSize: 14, margin: "4px 0 0", color: "#555" }}>
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
