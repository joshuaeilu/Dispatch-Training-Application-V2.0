import { useEffect, useState } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import Title from 'antd/es/typography/Title';
import { useNavigate } from 'react-router';
import { api } from '../../../../../utils/api';
import AssignmentDrawer, { type AssignmentDrawerData } from './AssignmentDrawer';

interface ActivityItem {
  id: string;
  name: string;
  completed: number;
  total: number;
}

const RecentActivitySection = () => {
  const [exercises, setExercises] = useState<ActivityItem[]>([]);
  const [scenarios, setScenarios] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<AssignmentDrawerData | undefined>();
  const [drawerKind, setDrawerKind] = useState<'scenario' | 'exercise'>('exercise');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const response = await api.get('/progress/recent-activity');
        setExercises(response.data.exercises);
        setScenarios(response.data.scenarios);
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const handleItemClick = async (item: ActivityItem, kind: 'scenario' | 'exercise') => {
    try {
      // Fetch the full item details
      const itemResponse = await api.get(`/${kind === 'exercise' ? 'exercises' : 'scenarios'}/${item.id}`);
      const itemData = itemResponse.data;

      // Fetch completed users
      let completedUsers = [];
      if (kind === 'exercise') {
        const submissionsResponse = await api.get(`/submissions/exercise/${item.id}`);
        completedUsers = submissionsResponse.data.map((sub: any) => ({
          user_id: sub.user_id,
          answers: sub.answers,
          submitted_at: sub.submitted_at
        }));
      } else {
        // For scenarios, get all scenario progress and filter for this scenario
        const progressResponse = await api.get('/scenarios/progress');
        const scenarioProgress = progressResponse.data.find((s: any) => s.id === item.id);
        if (scenarioProgress && scenarioProgress.attempts) {
          completedUsers = scenarioProgress.attempts.map((attempt: any) => ({
            user_id: attempt.user_id,
            answers: {}, // Scenarios might not have detailed answers
            submitted_at: attempt.submitted_at
          }));
        }
      }

      const drawerData: AssignmentDrawerData = {
        id: item.id,
        name: itemData.name || itemData.scenario_data?.name,
        audience: itemData.audience || itemData.scenario_data?.audience || 'All',
        completedUsers
      };

      setDrawerData(drawerData);
      setDrawerKind(kind);
      setDrawerOpen(true);
    } catch (error) {
      console.error('Failed to fetch item details:', error);
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg bg-white shadow-sm divide-y divide-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg bg-white shadow-sm divide-y divide-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-xl font-semibold text-[#891B2F]">Training Overview</h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitor progress across exercises and scenarios at a glance.
          </p>
        </div>

        <Section
          title="Exercises"
          description="Completion status for recent training exercises."
          items={exercises}
          onViewAll={() => navigate('/dashboard/knowledge-check-progress')}
          onItemClick={(item) => handleItemClick(item, 'exercise')}
        />
        <Section
          title="Scenarios"
          description="Progress across active training scenarios."
          items={scenarios}
          onViewAll={() => navigate('/dashboard/scenario-progress')}
          onItemClick={(item) => handleItemClick(item, 'scenario')}
        />
      </div>

      <AssignmentDrawer
        drawerData={drawerData}
        open={drawerOpen}
        setOpen={setDrawerOpen}
        kind={drawerKind}
      />
    </>
  );
};

function Section({
  title,
  description,
  items,
  onViewAll,
  onItemClick,
}: {
  title: string;
  description: string;
  items: ActivityItem[];
  onViewAll: () => void;
  onItemClick: (item: ActivityItem) => void;
}) {
  return (
    <div className="border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 600, color: '#891B2F' }}>
            {title}
          </Title>
          <p className="mt-0.5 text-xs text-gray-600">{description}</p>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs cursor-pointer font-semibold text-[#891B2F] hover:text-[#6F1A27] transition-colors duration-150"
        >
          View all
        </button>
      </div>

      <div className="overflow-hidden">
        <table className="w-full border-collapse text-left">
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={1} className="px-4 py-8 text-center text-sm text-gray-500">
                  No recent activity
                </td>
              </tr>
            ) : (
              items.map(({ id, name, completed, total }) => (
                <tr 
                  key={id} 
                  className="group hover:bg-[#F8EDEE] transition-colors cursor-pointer"
                  onClick={() => onItemClick({ id, name, completed, total })}
                >
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium truncate">{name}</span>
                        <span className="text-xs text-gray-600">
                          <span className="font-semibold">{completed}</span>
                          <span className="mx-0.5 text-[#A32E41]">/</span>
                          <span className="text-[#891B2F]">{total}</span>
                          <span className="ml-1">completed</span>
                        </span>
                      </div>

                      <div className="inline-flex items-center justify-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F1D8DC] transition-all duration-200 group-hover:bg-[#EAD0D5] group-hover:translate-x-0.5">
                          <ArrowRightOutlined className="text-[11px]" style={{ color: '#8C2131' }} />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { RecentActivitySection };
