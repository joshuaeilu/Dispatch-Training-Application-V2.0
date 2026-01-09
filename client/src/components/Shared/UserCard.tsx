import { Avatar, Typography, Badge } from "antd";
import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";
import { toTitleCase } from "../../utils/tools";
import { DATA_URL } from "../../data/data";
import { getToken } from "../../contexts/AuthProvider";

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
  const isCompleted = completed === totalAssignments && totalAssignments > 0;
  const token = getToken();

  const content = (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Avatar + Text */}
          <div className="flex items-start gap-4 min-w-0">
            <Avatar
              size={44}
              src={DATA_URL + imageUrl + '?token=' + token}
              icon={!imageUrl && <UserOutlined style={{ color:"#A32E41"}} />}
              className="shrink-0"
              style={{ backgroundColor: "#f0f0f0" }}
            />

            <div className="min-w-0 pt-0.5">
              <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                {toTitleCase(name)}
              </Title>

              <Text
                className="block mt-1 text-sm"
                style={{ color: "#555" }}
              >
                <span className="font-semibold text-gray-700">
                  {completed}
                </span>
                <span className="mx-1 text-gray-400">/</span>
                <span className="font-semibold text-brand-maroon">
                  {totalAssignments}
                </span>{" "}
                completed
              </Text>
            </div>
          </div>

          {/* Right: Arrow */}
          <div className="pt-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 group-hover:translate-x-0.5"
              style={{ backgroundColor: "rgba(140, 33, 49, 0.08)" }}
            >
              <ArrowRightOutlined
                className="text-[12px]"
                style={{ color: "#8C2131" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return isCompleted ? (
    <Badge.Ribbon text="All completed" color="green">
      {content}
    </Badge.Ribbon>
  ) : (
    content
  );
}
