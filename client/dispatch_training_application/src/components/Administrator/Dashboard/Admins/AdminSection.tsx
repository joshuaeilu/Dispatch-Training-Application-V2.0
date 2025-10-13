import { PageHeader } from "../../../Shared/PageHeader";
import { getUsers } from "../../../../contexts/UniversalHelpers";
import UserCard from "../../../Shared/UserCard";
import { PROFILE_PIC_URL } from "../../../../data/data";
import { getToken } from "../../../../contexts/AuthProvider";
import { Row, Col } from "antd";

export default function DispatchersSection() {
  const { users } = getUsers();
  const token = getToken();

  const admins = users.filter((user) => user.role === "admin");

  return (
    <div style={{ overflow: "auto" }}>
      <PageHeader
        title="Administrators"
        subtitle="Assess Administrators Progress"
        onBack={() => window.history.back()}
        showBackButton
      
      />

      <div style={{ padding: "0 1.5rem" }}>
        <Row gutter={[24, 24]}>
          {admins.map((user) => (
            <Col
              key={user.id}
              xs={24}
              sm={12}
              md={8}
              lg={6}
            >
              <UserCard
                name={user.name}
                imageUrl={`${PROFILE_PIC_URL}${user.avatar}?token=${token}`}
                completed={6}
                totalAssignments={12}
                knowledgeChecks={{ completed: 4, total: 8 }}
                scenarios={{ completed: 4, total: 4 }}
              />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
