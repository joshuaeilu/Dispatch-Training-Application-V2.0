import { ApartmentOutlined, AppstoreFilled, AudioOutlined, DeleteColumnOutlined, DeleteOutlined, FileTextOutlined, PictureOutlined, PlaySquareOutlined, QuestionCircleFilled, QuestionCircleOutlined, UserOutlined,} from "@ant-design/icons";
import type {  ResourceCategory, ResourceKey, Role, MenuItem, Exercise, TableColumnDef, ExerciseTableType } from '../types/index.types';
import type { ResourceTableType } from "../types/index.types";
import { removeS } from "../utils/tools";
import React from "react";
import { toTitleCase } from "../utils/tools";
import { TableActionButton } from "../components/Shared/TableActionButton";

import { ArrowTopRightOnSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
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

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: "bg-green-50 text-green-700 ring-green-600/20",
  Medium: "bg-orange-50 text-orange-700 ring-orange-600/20",
  Hard: "bg-red-50 text-red-700 ring-red-600/20",
};

type Status = "draft" | "published";

export const STATUS_STYLES: Record<Status, string> = {
  draft: " bg-gray-50 text-gray-700 ring-gray-600/20",
  published: "bg-green-50 text-green-700 ring-green-600/20",
};


export const RESOURCE_CATEGORIES: ResourceCategory[] = [
   
    {
        key: "documents",
        label: "Documents",
        icon: <FileTextOutlined style={{ fontSize: 18 }} />,
    },
    {
        key: "videos",
        label: "Videos",
        icon: <PlaySquareOutlined style={{ fontSize: 18 }} />,
    },
    {
        key: "audios",
        label: "Audio",
        icon: <AudioOutlined style={{ fontSize: 18 }} />,
    },
    {
        key: "images",
        label: "Images",
        icon: <PictureOutlined style={{ fontSize: 18 }} />,
    },
];


export const resourceColumns: TableColumnDef<ResourceTableType>[] = [
  {
    key: 'name',
    header: 'Name',
    align: 'text-left',
    render: (e: ResourceTableType) => <span className="font-medium text-gray-900">{e.name}</span>,
    searchable: true,
    filterable: true,
  },
  {key: 'description',
    header: 'Description',
    align: 'text-left',
    render: (e: ResourceTableType) => <span className="text-gray-600">{e.description}</span>,
    searchable: true,
    filterable: false,
  },
  {
    key: 'type',
    header: 'Type',
    align: 'text-left',
    render: (e: ResourceTableType) => <span className="text-gray-600">{toTitleCase(removeS(e.type))}</span>,
    searchable: false,
    filterable: true,
  },
  {
    header: 'Actions',
    align: 'text-center',
    render: () => (
      <div className="flex justify-end gap-2">
        <TableActionButton
  title="Edit"
  icon={ArrowTopRightOnSquareIcon}
  color="blue"
  onPress={()=> alert("View")}
/>

<TableActionButton
  title="Delete"
  icon={TrashIcon}
  color="red"
  onPress={()=>alert("delete")}
/>

    </div>
    ),
  },
]
export const resourceFilterOptions = {
  type: ["documents", "videos", "audios", "images"],
};


export const TYPE_META: Record<ResourceKey, {
  label: string;
  icon: React.ReactNode;
  color: "purple" | "blue" | "green" | "gold" | "danger" | "default" | "primary" | "cyan" | "magenta" | "pink" | "red" | "orange" | "yellow" | "volcano" | "geekblue" | "lime";
}> = {
    
  documents: {
    label: "DOCUMENT",
    icon: <FileTextOutlined />,
    color: "purple",
  },
  images: {
    label: "IMAGE",
    icon: <PictureOutlined />,
    color: "blue",
  },
  videos: {
    label: "VIDEO",
    icon: <PlaySquareOutlined />,
    color: "green",
  },
  audios: {
    label: "AUDIO",
    icon: <AudioOutlined />,
    color: "gold",
  },
 
};


export const knowledgeCheckColumns: TableColumnDef<ExerciseTableType> [] = [
  {
    key: 'name',
    header: 'Name',
    align: 'text-left',
    render: (e: ExerciseTableType) => <span className="font-medium text-gray-900">{e.name}</span>,
    searchable: true,
    filterable: true,
  },
  {
    key: 'type',
    header: 'Type',
    align: 'text-left',
    render: (e: ExerciseTableType) => <span className="font-medium text-gray-900">{e.type}</span>,
    searchable: true,
    filterable: true,
  },
    {
    key: 'difficulty',
    header: 'Difficulty',
    align: 'text-left',
    render: (e: ExerciseTableType) => <span
  className={`
    inline-flex items-center
    rounded-full
    px-2.5 py-0.5
    text-xs font-medium
    ring-1 ring-inset
    ${DIFFICULTY_STYLES[e.difficulty]}
  `}
>
  {e.difficulty}
</span>,
    searchable: false,
    filterable: true,
  },
   { 
    header: "Count",
    align: 'text-left',
    render: (e: ExerciseTableType) => (<span
        className="
          inline-flex items-center
          rounded-full
          bg-gray-50
          px-2.5 py-0.5
          text-xs font-medium
          text-gray-700
          ring-1 ring-inset ring-gray-600/20
        "
      >
        {e.questionCount}{" "}
        {e.questionCount === 1 ? "question" : "questions"}

      </span>),
      searchable: false,
      filterable: false
   },
    {
    key: 'status',
    header: 'Status',
    align: 'text-left',
    render: (e: ExerciseTableType) => <span
  className={`
    inline-flex items-center
    rounded-full
    px-2.5 py-0.5
    text-xs font-medium
    ring-1 ring-inset
    ${STATUS_STYLES[e.status]}
  `}>{e.status}</span>,
   filterable: false,
   searchable: false
  }

]




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
