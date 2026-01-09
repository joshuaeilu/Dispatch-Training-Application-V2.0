import UserProgressSection from "../components/UserProgressSection"

interface UsersPageProps {
    role: "dispatcher" | "trainee";
}


export default function UsersPage({ role }: UsersPageProps) {
  const config = {
    dispatcher: {
      title: "Dispatchers",
      subtitle: "Assess dispatchers progress",
    },
    trainee: {
      title: "Trainees",
      subtitle: "Assess trainee progress",
    },
  }

  const selectedConfig = config[role]

  return (
    <UserProgressSection
      role={role}
      title={selectedConfig.title}
      subtitle={selectedConfig.subtitle}
      navigateTo="/dashboard/user-progress"
    />
  )
}
