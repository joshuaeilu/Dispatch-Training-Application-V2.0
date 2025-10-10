import { PageHeader } from "../../../Shared/PageHeader";
import { getUsers } from "../../../../contexts/UniversalHelpers";
import UserCard from "../../../Shared/UserCard";
import { PROFILE_PIC_URL } from "../../../../data/data";
import { getToken } from "../../../../contexts/AuthProvider";
export default function DispatchersSection(){

    const { users } = getUsers();
    const token = getToken();
    return (
        <div style={{ padding: '20px', overflow: 'auto', height: '100%' }}>
        <PageHeader title="Trainees" subtitle="Assess Trainees Progress" onBack={() => window.history.back()} showBackButton  />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
          {users.filter(user => user.role === 'trainee').map((user) => (
            <UserCard
              key={user.id}
              name={user.name}
              imageUrl={PROFILE_PIC_URL + user.avatar + "?token="+ token }
             
            />
          ))}
        </div>
        </div>
    )
}