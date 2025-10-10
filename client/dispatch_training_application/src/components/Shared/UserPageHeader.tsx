import { Typography } from "antd"

const { Title, Paragraph } = Typography

export default function UserPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ backgroundColor: "#8C2131", color: "#fff", padding: "2rem 1.5rem", borderBottom: "1px solid #eee" }}>
      <div style={{ margin: "0 auto" }}>
        <Title level={2} style={{ color: "#fff", marginBottom: 12 }}>
          {title}
        </Title>
        {subtitle && <Paragraph style={{ fontSize: 16, color: "#f5f5f5" }}>{subtitle}</Paragraph>}
      </div>
    </div>
  )
}
