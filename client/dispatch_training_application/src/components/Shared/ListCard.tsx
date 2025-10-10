import { Card, Tag, Typography, Space, Button } from "antd";
import { PlayCircleOutlined, ClockCircleOutlined, CheckCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

export interface ListCardProps {
  name: string;
  completed?: boolean;
  description: string;
  type: string;
  onClick: () => void;
}

export default function ListCard({
  name,
  completed = false,
  description,
  type,
  onClick,
}: ListCardProps) {
  return (
    <Card
      hoverable
      style={{ borderRadius: 10, maxWidth: 380 }}
      bodyStyle={{ padding: "16px" }}
      onClick={onClick}
      
      
    >
      <Space direction="vertical" size={4} >
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
           {/* Title */}
          <Title level={5} style={{ margin: 0 }}>
            {name}
          </Title>
          <CheckCircleFilled
            style={{
              fontSize: 20,
              color: completed ? "#52c41a" : "#d9d9d9", // green if done, gray if not
            }}
          />
        </Space>
     

        {/* Type Tag */}
        <Tag color="default">{type}</Tag>

        {/* Description */}
        <Text type="secondary">{description}</Text>
      </Space>

      <div style={{ marginTop: 16, borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
        <Space style={{ justifyContent: "space-between" }}>
         

          <Button
            type="default"
            icon={<PlayCircleOutlined />}
          >
            Replay
          </Button>
        </Space>
      </div>
    </Card>
  );
}
