import { PageHeader } from "../../../Shared/PageHeader";
import { getUsers } from "../../../../contexts/UniversalHelpers";
import UserCard from "../../../Shared/UserCard";
import { PROFILE_PIC_URL } from "../../../../data/data";
import { getToken } from "../../../../contexts/AuthProvider";
import { Row, Col } from "antd";
import {useState } from "react";
import { useUsersProgress } from "../../../../hooks/useUsersProgress";
export default function TraineesSection() {
  const { users } = getUsers();
  const token = getToken();

  const trainees = users.filter((user) => user.role === "trainee");

  const traineesIds = trainees.map((trainee) => trainee.id);

  // Add a map to store progress per trainee
const [progressMap, setProgressMap] = useState<Record<string, any>>({});

const {progress} = useUsersProgress(traineesIds);

  return (
    <div style={{ overflow: "auto" }}>
      <PageHeader
        title="Trainees"
        subtitle="Assess Trainees Progress"
        onBack={() => window.history.back()}
        showBackButton
        
      />

      <div style={{ padding: "0 1.5rem" }}>
        <Row gutter={[24, 24]}>
          {trainees.map((user) => (
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
