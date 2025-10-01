import dayjs, { Dayjs } from "dayjs";

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

type HighlightRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type HighlightData = {
  id: string;
  text: string;               // Highlighted text
  name: string;               // User-defined name
  page: number;               // Page number where highlight appears
  containerIndex: number;     // Index of the span (optional if no longer used)
  startOffset: number;        // Start offset in the span
  endOffset: number;          // End offset in the span
  rects: HighlightRect[];     // Bounding boxes of the highlighted area
};

export type PdfViewerProps = {
  // pdfUrl: string;
  highlights: HighlightData[];
  setHighlights?: (highlights: HighlightData[]) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  pageRefs?: React.RefObject<(HTMLDivElement | null)[]>;
};

export interface HighlightTagListProps {
  highlights: HighlightData[];
  setHighlights: (highlights: HighlightData[] ) => void;
  scrollToHighlight: (highlight: HighlightData) => void;
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
  highlights: HighlightData[];
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
  scenario: Scenario;
  setScenario: React.Dispatch<React.SetStateAction<Scenario>>;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  scrollHighlight: (highlight: HighlightData) => void;
}


export type ScenarioTableType = {
  id: string;
  authorId: string;
  name: string;
  type: string;
  difficulty: string;
  questionsCount: number;
  status: string;
  audience: string;
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

