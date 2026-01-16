import { Dayjs } from "dayjs";



// PageHeader Component Props
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

// AdminWelcomeSection Props
export interface AdminWelcomeSectionProps {
  avatarUrl?: string;
  name?: string;
  role?: string;
  stats: { label: string; value: number }[];
}

// Universal Helpers Context Types
export interface UniversalHelpersCtx {
  preferences: AdminPreferences | null;
  setPreferences: React.Dispatch<React.SetStateAction<AdminPreferences | null>>;
  users: GetUser[];
  setUsers: React.Dispatch<React.SetStateAction<GetUser[]>>;
}

// Table Viewer Component Types
export interface TableViewerProps<T> {
  tableType?: string
  columnDefinitions: TableColumnDef<T>[]
  columnData: T[]
  filterOptions?: Record<string, string[]>
  onButtonPress?: () => void
  loading?: boolean
}
export interface TableColumnDef<T> {
  key?: keyof T & string
  header: string
  render: (row: T) => React.ReactNode
  align?: string
  searchable?: boolean
  filterable?: boolean
}

export type AdminTableProps<T> = {
  columns: TableColumnDef<T>[]
  data: T[]
}


// Table progress Types
export interface ProgressTableType {
  id: string;
  name: string;
  audience: string;
  completedAssignments: number;
  totalAssignments: number;
  completionPercentage: number;
  completedUsers: [];
  exerciseId?: string;
  userAnswers?: Record<string, any>;
  createdOn: string;
}



// Authentication Types
export type Role = 'admin' | 'dispatcher' | 'trainee';
export type User = { id: string; username: string; role: Role, avatar: string } | null;
export type Ctx = {
  user: User | null;
  token: string | null;
  setAuth: (token: string, user: NonNullable<User>) => void;
  logout: () => void;
};

export type Speaker = {
  id: string;
  name: string;
  voice: string | undefined;
}




export interface ScenarioTime{
  time: Dayjs | null | string;
  day: string;
  season: string;
}

export interface Scene {
  id: string;
  speaker: string;
  sceneDescription: string;
  options: string[];
  correctOption: string | null;
  tip: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: string;
  audience: string;
  timing: ScenarioTime;
  speakers: Speaker[];
  scenes: Scene[];
  status?: 'draft' | 'published';
}

export type AdminPreferences = {
  exercise_types?: string[];
  scenario_types?: string[];
  speakers?: string[];
};

export interface SceneEditorProps {
  scenario: Scenario | undefined;
  setScenario: React.Dispatch<React.SetStateAction<Scenario | undefined>>;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}


export type ScenarioTableType = {
  id: string;
  authorId: string;
  name: string;
  type: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionCount: number;
  status: "draft" | "published";
  audience: "All" | "Dispatchers" | "Trainees";
  visibility: boolean;
  scenes: Scene[];
  created_by: {
    name: string;
    avatar_url: string;
  };
};

export type MenuItem = {
  key: string;            // use route path
  icon?: React.ReactNode;
  label: string;
};
export interface ResourcePreview{
  id: string;
  name: string;
  description: string;
  type: string;
  mimeType: string;
  url: string;
}

export type Option = { id: number; text: string; };

export interface Question {
  id: string;
  question: string;
  resource?: ResourcePreview | null;
  questionCategory?: string;
  answerType: "text-area" | "multiple-choice";
  correctAnswer?: string;
  options: Option[];
  correctOptions: string[];
  tip?: string;
}
export interface Exercise{
  id: string;
  name: string;
  type: string;
  difficulty: "Easy" | "Medium" | "Hard";
  audience: "All" | "Dispatchers" | "Trainees";
  status: "draft" | "published";
  visibility?: boolean;
  createdBy: string | created_by;
  questions: Question[];
  created_at?: string;

}
interface created_by {
  id: string;
  name: string;
  avatar_url: string;
}

export interface ExerciseTableType{
  id: string;
  name: string;
  type: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionCount: number;
  audience: "All" | "Dispatchers" | "Trainees";
  status: "draft" | "published";
  visibility: boolean;
  created_by: created_by;
  questions: Question[];

}


export type ResourceKey =
  | "document"
  | "video"
  | "audio"
  | "image";

export interface ResourceCategory {
  key: ResourceKey;
  label: string;
  icon: React.ReactNode;
}

export interface ResourceTableType{
  id: string;
  name: string;
  type: ResourceKey;
  mime_type: string;
  url: string;
  size: number;
  description: string;
  created_at: string;
  visibility: boolean;
  created_by: {
    id: string;
    name: string;
    avatar_url: string;
  };

}


export interface AddQuestionsSectionsProps {
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  exercise: Exercise;
  setExercise: React.Dispatch<React.SetStateAction<Exercise | null>>;
}

export interface ResourcePayload {
  id: string;
  name: string;
  type: string;
  description?: string;
  size: number;
  mime_type: string;
  file: File;
  visibility: boolean;
}

export interface ResourceFile{
  id: string;
  name: string;
  type: string;
  size: number;
  mime_type: string;
  createdAt: string;
  createdBy: string;
}
export interface GetUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
}