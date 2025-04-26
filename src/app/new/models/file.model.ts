export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  extension: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  parentId: string | null;
  path: string[];
}

export interface FolderItem {
  id: string;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
  parentId: string | null;
  path: string[];
  children: string[]; // IDs of child files and folders
}

export enum FileType {
  Document = 'document',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Archive = 'archive',
  Code = 'code',
  Other = 'other'
}

export interface FileViewOptions {
  viewMode: 'list' | 'grid';
  sortBy: 'name' | 'type' | 'size' | 'date';
  sortDirection: 'asc' | 'desc';
  filter: string | null;
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}