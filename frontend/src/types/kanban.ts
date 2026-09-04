import { AuthUser } from "./auth";

export type BoardRole = "OWNER" | "EDITOR" | "VIEWER";

export interface BoardSummary {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: AuthUser;
  role: "OWNER" | "MEMBER";
  _count: { columns: number; tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  id: string;
  role: BoardRole;
  createdAt: string;
  user: AuthUser;
}

export interface Task {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description: string | null;
  position: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: number;
  tasks: Task[];
}

export interface BoardDetail {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: AuthUser;
  members: BoardMember[];
  columns: Column[];
  /** The current user's effective permission level on this board. */
  myRole: BoardRole;
  createdAt: string;
  updatedAt: string;
}
