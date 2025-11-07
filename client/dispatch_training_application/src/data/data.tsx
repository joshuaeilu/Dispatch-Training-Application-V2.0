import { ApartmentOutlined, AppstoreFilled, AudioOutlined, BookOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, FileTextOutlined, PictureOutlined, PlaySquareOutlined, QuestionCircleFilled, QuestionCircleOutlined, SearchOutlined, SnippetsOutlined, UploadOutlined, UserOutlined, VideoCameraOutlined } from "@ant-design/icons";
import type {  ResourceCategory, ResourceKey, Role, MenuItem } from '../types/index.types';

import React from "react";
  export const exerciseDifficultyOptions = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];
  export const exerciseStatusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
  ];



export const RESOURCE_CATEGORIES: ResourceCategory[] = [
    {
        key: "all",
        label: "All Resources",
        icon: <FileTextOutlined style={{ fontSize: 18 }} />,
    },
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
        key: "audio",
        label: "Audio",
        icon: <AudioOutlined style={{ fontSize: 18 }} />,
    },
    {
        key: "images",
        label: "Images",
        icon: <PictureOutlined style={{ fontSize: 18 }} />,
    },
];



export const TYPE_META: Record<ResourceKey, {
  label: string;
  icon: React.ReactNode;
  color: "purple" | "blue" | "green" | "gold" | "danger" | "default" | "primary" | "cyan" | "magenta" | "pink" | "red" | "orange" | "yellow" | "volcano" | "geekblue" | "lime";
}> = {
    all: {
        label: "ALL",
        icon: <UserOutlined />,
        color: "default",
    },
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
  audio: {
    label: "AUDIO",
    icon: <AudioOutlined />,
    color: "gold",
  },
 
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "default",
  published: "geekblue",
};

export const AUDIENCE_COLORS: Record<string, string> = {
  all: "geekblue",
  trainees: "purple",
  dispatchers: "cyan",
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
    { key: '/mop', icon: <EnvironmentOutlined />, label: 'MOP' },
  ],
  trainee: [
    { key: '/resources', icon: <UserOutlined />, label: 'Resources' },
    { key: '/user-knowledge-checks', icon: <QuestionCircleFilled />, label: 'Knowledge Checks' },
    { key: '/scenario-walkthroughs', icon: <ApartmentOutlined />, label: 'Scenario Walkthroughs' },
    { key: '/mop', icon: <BookOutlined />, label: 'MOP' },
  ],
};





export const RESOURCE_URL = "http://localhost:5000/data";
export const PROFILE_PIC_URL = "http://localhost:5000/data";