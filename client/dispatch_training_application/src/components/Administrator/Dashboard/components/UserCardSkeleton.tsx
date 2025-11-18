import { Card, Skeleton, Space, Avatar } from "antd";

export default function UserCardSkeleton() {
  return (
    <Card
      className="transition-all duration-200 ease-out"
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        background: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "0.5rem",
      }}
    >
      <Space size={16} align="start">
        {/* Avatar skeleton */}
        <Skeleton.Avatar
          active
          size={56}
          shape="circle"
          style={{ backgroundColor: "#e8e8e8" }}
        />

        <div style={{ flex: 1 }}>
          {/* Name line */}
          <Skeleton.Input
            active
            size="small"
            style={{
              width: 140,
              marginBottom: 8,
              borderRadius: 6,
            }}
          />

          {/* Subtext */}
          <Skeleton.Input
            active
            size="small"
            style={{
              width: 180,
              borderRadius: 6,
            }}
          />
        </div>
      </Space>
    </Card>
  );
}
