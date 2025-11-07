import { Card, Avatar, Typography,  Row, Col, Space, Badge } from "antd";
import {
  UserOutlined,
} from "@ant-design/icons";
import { toTitleCase } from "../../utils/tools";

const { Text, Title } = Typography;

type Props = {
  name: string;
  imageUrl?: string;
  completed: number;
  totalAssignments: number;
  onClick: () => void;
};

export default function UserCard({
  name,
  imageUrl,
  completed,
  totalAssignments,
  onClick,
}: Props) {

  return (
    <Card
      hoverable
      onClick={onClick}
      className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl"

      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        background: "#fff",
        height: "100%", // Ensures equal height within a grid column
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header: Avatar + Name + Status */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
  <Col >
    <Space size={16} align="start">
      <Avatar
        size={56}
        src={imageUrl}
        icon={!imageUrl && <UserOutlined />}
        style={{
          backgroundColor: "#f0f0f0",
        }}
      />
      <div>
       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
         <Title level={3} style={{ margin: 0, fontSize: 18 }}>
          {toTitleCase(name)}
        </Title>
       
       </div>
        <Text style={{ fontSize: 13, color: "#8c8c8c", fontWeight: 500 }}>
          {completed} of {totalAssignments} assignments completed
        </Text>
         {completed == totalAssignments && totalAssignments > 0 && (
        <Badge.Ribbon  text="All Completed!" color="green" />
      )}
      </div>
     
    </Space>
  </Col>


</Row>



     
     
    </Card>
  );
}
