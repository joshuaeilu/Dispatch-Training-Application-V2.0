import { ApartmentOutlined, AppstoreFilled, AudioOutlined, DeleteColumnOutlined, DeleteOutlined, EditOutlined, FileTextOutlined, PictureOutlined, PlaySquareOutlined, QuestionCircleFilled, QuestionCircleOutlined, UserOutlined,} from "@ant-design/icons";
import type {  ResourceCategory, ResourceKey, Role, MenuItem, Exercise, TableColumnDef, ExerciseTableType, ScenarioTableType } from '../types/index.types';
import type { ResourceTableType } from "../types/index.types";
import { removeS } from "../utils/tools";
import React from "react";
import { toTitleCase } from "../utils/tools";
import { TableActionButton } from "../components/Shared/TableActionButton";

import { ArrowTopRightOnSquareIcon, PencilIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
  export const exerciseDifficultyOptions = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];
  export const exerciseStatusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
  ];



export const DATA_URL = "http://localhost:5000/data";
type Difficulty = "Easy" | "Medium" | "Hard";

export const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: "bg-green-50 text-green-700 ring-green-600/20",
  Medium: "bg-orange-50 text-orange-700 ring-orange-600/20",
  Hard: "bg-red-50 text-red-700 ring-red-600/20",
};

type Status = "draft" | "published";

export const STATUS_STYLES: Record<Status, string> = {
  draft: " bg-gray-50 text-gray-700 ring-gray-600/20",
  published: "bg-blue-50 text-blue-700 ring-blue-600/20",
};

type Audience = "All" | "Trainees" | "Dispatchers";

export const AUDIENCE_STYLES: Record<Audience, string> = {
  All: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Trainees: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Dispatchers: "bg-amber-50 text-amber-700 ring-amber-600/20",
};


export const RESOURCE_CATEGORIES: ResourceCategory[] = [
   
    {
        key: "document",
        label: "Documents",
        icon: <FileTextOutlined style={{ fontSize: 18 }} />,
    },
    {
        key: "video",
        label: "Videos",
        icon: <PlaySquareOutlined style={{ fontSize: 18 }} />,
    },
    {
        key: "audio",
        label: "Audios",
        icon: <AudioOutlined style={{ fontSize: 18 }} />,
    },
    {
        key: "image",
        label: "Images",
        icon: <PictureOutlined style={{ fontSize: 18 }} />,
    },
];




export const knowledgeCheckFilterOptions = {
  status: ["draft", "published"],
  difficulty: ["Easy", "Medium", "Hard"],
  audience: ["All", "Trainees", "Dispatchers"],
}





export const TYPE_META = {
  document: {
    label: "Document",
    color: "blue",
    icon: <FileTextOutlined />,
  },
  video: {
    label: "Video",
    color: "purple",
    icon: <PlaySquareOutlined />,
  },
  audio: {
    label: "Audio",
    color: "green",
    icon: <AudioOutlined />,
  },
  image: {
    label: "Image",
    color: "geekblue",
    icon: <PictureOutlined />,
  },
};







export const MENU_BY_ROLE: Record<Role, MenuItem[]> = {
  admin: [
    { key: '/dashboard', icon: <AppstoreFilled />, label: 'Dashboard' },
    { key: '/resource-manager', icon: <FileTextOutlined />, label: 'Resources' },
    { key: '/knowledge-checks', icon: <QuestionCircleOutlined />, label: 'Knowledge Checks' },
    { key: '/scenario-manager', icon: <ApartmentOutlined />, label: 'Scenario Manager' },
  ],
  dispatcher: [
    { key: '/resources', icon: <UserOutlined />, label: 'Resources' },
    { key: '/user-knowledge-checks', icon: <QuestionCircleFilled />, label: 'Knowledge Checks' },
    { key: '/scenario-walkthroughs', icon: <ApartmentOutlined />, label: 'Scenario Walkthroughs' },
  ],
  trainee: [
    { key: '/resources', icon: <UserOutlined />, label: 'Resources' },
    { key: '/user-knowledge-checks', icon: <QuestionCircleFilled />, label: 'Knowledge Checks' },
    { key: '/scenario-walkthroughs', icon: <ApartmentOutlined />, label: 'Scenario Walkthroughs' },
  ],
};





export const RESOURCE_URL = "/data";
export const PROFILE_PIC_URL = "http://localhost:5000/data";
