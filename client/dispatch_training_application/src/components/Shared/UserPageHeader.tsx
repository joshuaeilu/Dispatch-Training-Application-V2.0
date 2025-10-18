import { Typography } from "antd"

const { Title, Paragraph } = Typography

export default function UserPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ backgroundColor: "#8C2131", color: "#fff", borderBottom: "1px solid #eee", }} className="p-4 lg:p-6 ">
      <div >
        <Title level={2} style={{ color: "#fff", marginBottom: 12 }}>
          {title}
        </Title>
        {subtitle && <Paragraph style={{ fontSize: 16, color: "#f5f5f5" }}>{subtitle}</Paragraph>}
      </div>
    </div>
  )
}
