import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileItem, FolderItem, FileType, FileViewOptions, BreadcrumbItem } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private files = new BehaviorSubject<FileItem[]>([]);
  private folders = new BehaviorSubject<FolderItem[]>([]);
  private currentFolderId = new BehaviorSubject<string | null>(null);
  public currentFolderId$ = this.currentFolderId.asObservable();

  private viewOptions = new BehaviorSubject<FileViewOptions>({
    viewMode: 'grid',
    sortBy: 'name',
    sortDirection: 'asc',
    filter: null
  });

  constructor() {
    this.initializeDemoData();
  }

  // Public API
  public getCurrentFolder(): Observable<FolderItem | null> {
    return this.currentFolderId.pipe(
      map(id => {
        if (id === null) return null;
        return this.folders.value.find(folder => folder.id === id) || null;
      })
    );
  }

  public getFoldersRecursive(): FolderItem[] {
    return this.folders.value;
  }
  

  public getFiles(folderId: string | null): Observable<FileItem[]> {
    return this.files.pipe(
      map(files => files.filter(file => file.parentId === folderId))
    );
  }

  public getFolders(parentId: string | null): Observable<FolderItem[]> {
    return this.folders.pipe(
      map(folders => folders.filter(folder => folder.parentId === parentId))
    );
  }

  public getAllFilesAndFolders(parentId: string | null): Observable<(FileItem | FolderItem)[]> {
    return new Observable(observer => {
      const files = this.files.value.filter(file => file.parentId === parentId);
      const folders = this.folders.value.filter(folder => folder.parentId === parentId);

      const combined = [...folders, ...files];
      observer.next(this.sortItems(combined));
      observer.complete();
    });
  }

  public navigateToFolder(folderId: string | null): void {
    this.currentFolderId.next(folderId);
  }

  public getViewOptions(): Observable<FileViewOptions> {
    return this.viewOptions.asObservable();
  }

  public updateViewOptions(options: Partial<FileViewOptions>): void {
    this.viewOptions.next({ ...this.viewOptions.value, ...options });
  }

  public getBreadcrumbs(): Observable<BreadcrumbItem[]> {
    return this.currentFolderId.pipe(
      map(id => {
        const breadcrumbs: BreadcrumbItem[] = [{ id: null, name: 'Home' }];

        if (id === null) return breadcrumbs;

        const folder = this.folders.value.find(f => f.id === id);
        if (!folder) return breadcrumbs;

        if (folder.path.length > 0) {
          for (let i = 0; i < folder.path.length; i++) {
            const pathId = folder.path[i];
            const pathFolder = this.folders.value.find(f => f.id === pathId);
            if (pathFolder) {
              breadcrumbs.push({ id: pathFolder.id, name: pathFolder.name });
            }
          }
        }

        breadcrumbs.push({ id: folder.id, name: folder.name });
        return breadcrumbs;
      })
    );
  }

  public createFolder(name: string, parentId: string | null): void {
    const parentFolder = parentId ? this.folders.value.find(f => f.id === parentId) : null;
    const path = parentFolder ? [...parentFolder.path, parentFolder.id] : [];

    const newFolder: FolderItem = {
      id: Date.now().toString(),
      name,
      createdAt: new Date(),
      modifiedAt: new Date(),
      parentId,
      path,
      children: []
    };

    this.folders.next([...this.folders.value, newFolder]);

    if (parentId) {
      this.updateFolderChildren(parentId, newFolder.id);
    }
  }

  public moveItem(itemId: string, isFolder: boolean, targetFolderId: string | null): void {
    if (isFolder) {
      const folder = this.folders.value.find(f => f.id === itemId);
      if (!folder) return;

      const targetFolder = targetFolderId ? this.folders.value.find(f => f.id === targetFolderId) : null;
      const newPath = targetFolder ? [...targetFolder.path, targetFolder.id] : [];

      // Update the folder and all its children's paths
      this.updateFolderAndChildrenPaths(folder, newPath, targetFolderId);
    } else {
      const updatedFiles = this.files.value.map(file => {
        if (file.id === itemId) {
          const targetFolder = targetFolderId ? this.folders.value.find(f => f.id === targetFolderId) : null;
          const newPath = targetFolder ? [...targetFolder.path, targetFolder.id] : [];

          return {
            ...file,
            parentId: targetFolderId,
            path: newPath,
            modifiedAt: new Date()
          };
        }
        return file;
      });

      this.files.next(updatedFiles);
    }

    // Update children arrays of both old and new parent folders
    if (targetFolderId) {
      this.updateFolderChildren(targetFolderId, itemId);
    }
  }

  public uploadFile(file: File, parentId: string | null): void {
    const extension = file.name.split('.').pop() ?? '';
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: file.name.replace(`.${extension}`, ''),
      type: this.detectFileType(extension),
      extension,
      size: file.size,
      createdAt: new Date(),
      modifiedAt: new Date(),
      parentId,
      path: []
    };
  
    this.files.next([...this.files.value, newFile]);
  
    if (parentId) {
      this.updateFolderChildren(parentId, newFile.id);
    }
  }
  
  private detectFileType(ext: string): FileType {
    const lower = ext.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(lower)) return FileType.Image;
    if (['mp4', 'webm'].includes(lower)) return FileType.Video;
    if (['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt'].includes(lower)) return FileType.Document;
    if (['zip', 'tar', 'tar.gz'].includes(lower)) return FileType.Archive;
    return FileType.Code;
  }



  // public downloadFile(fileId: string): void {
  //   const file = this.files.value.find(f => f.id === fileId);
  //   if (!file) return;

  //   // In a real implementation, this would trigger a download
  //   // For demo purposes, we'll just log the action
  //   console.log(`Downloading file: ${file.name}`);
  // }

  public deleteItem(id: string, isFolder: boolean): void {
    if (isFolder) {
      this.deleteFolder(id);
    } else {
      const updatedFiles = this.files.value.filter(file => file.id !== id);
      this.files.next(updatedFiles);

      const file = this.files.value.find(f => f.id === id);
      if (file && file.parentId) {
        this.removeFolderChild(file.parentId, id);
      }
    }
  }

  public getItem(id: string, isFolder: boolean): FileItem | FolderItem | null {
    if (isFolder) {
      return this.folders.value.find(folder => folder.id === id) || null;
    } else {
      return this.files.value.find(file => file.id === id) || null;
    }
  }

  renameItem(id: string, newName: string, isFolder: boolean): void {
    if (isFolder) {
      const updatedFolders = this.folders.value.map(folder =>
        folder.id === id ? { ...folder, name: newName, modifiedAt: new Date() } : folder
      );
      this.folders.next(updatedFolders);
    } else {
      const updatedFiles = this.files.value.map(file =>
        file.id === id ? { ...file, name: newName, modifiedAt: new Date() } : file
      );
      this.files.next(updatedFiles);
    }
  }
  

  // Private helper methods
  private initializeDemoData(): void {
    // Create some demo folders
    const documents: FolderItem = {
      id: '1',
      name: 'Documents',
      createdAt: new Date('2023-01-15'),
      modifiedAt: new Date('2023-04-22'),
      parentId: null,
      path: [],
      children: ['5', '6', '7']
    };

    const images: FolderItem = {
      id: '2',
      name: 'Images',
      createdAt: new Date('2023-02-10'),
      modifiedAt: new Date('2023-04-15'),
      parentId: null,
      path: [],
      children: ['8', '9', '10']
    };

    const videos: FolderItem = {
      id: '3',
      name: 'Videos',
      createdAt: new Date('2023-03-05'),
      modifiedAt: new Date('2023-03-05'),
      parentId: null,
      path: [],
      children: ['11', '12']
    };

    const projects: FolderItem = {
      id: '4',
      name: 'Projects',
      createdAt: new Date('2023-04-01'),
      modifiedAt: new Date('2023-04-10'),
      parentId: null,
      path: [],
      children: ['13', '14']
    };

    // Create some demo files
    const files: FileItem[] = [
      {
        id: '5',
        name: 'Report',
        type: FileType.Document,
        extension: 'docx',
        size: 2500000,
        createdAt: new Date('2023-01-20'),
        modifiedAt: new Date('2023-04-22'),
        parentId: '1',
        path: []
      },
      {
        id: '6',
        name: 'Budget',
        type: FileType.Document,
        extension: 'xlsx',
        size: 1800000,
        createdAt: new Date('2023-02-15'),
        modifiedAt: new Date('2023-03-10'),
        parentId: '1',
        path: []
      },
      {
        id: '7',
        name: 'Presentation',
        type: FileType.Document,
        extension: 'pptx',
        size: 5200000,
        createdAt: new Date('2023-03-20'),
        modifiedAt: new Date('2023-03-20'),
        parentId: '1',
        path: []
      },
      {
        id: '8',
        name: 'Profile Photo',
        type: FileType.Image,
        extension: 'jpg',
        size: 1200000,
        createdAt: new Date('2023-01-10'),
        modifiedAt: new Date('2023-01-10'),
        parentId: '2',
        path: []
      },
      {
        id: '9',
        name: 'Landscape',
        type: FileType.Image,
        extension: 'png',
        size: 3600000,
        createdAt: new Date('2023-02-05'),
        modifiedAt: new Date('2023-02-05'),
        parentId: '2',
        path: []
      },
      {
        id: '10',
        name: 'Logo',
        type: FileType.Image,
        extension: 'svg',
        size: 500000,
        createdAt: new Date('2023-03-01'),
        modifiedAt: new Date('2023-04-15'),
        parentId: '2',
        path: []
      },
      {
        id: '11',
        name: 'Tutorial',
        type: FileType.Video,
        extension: 'mp4',
        size: 25000000,
        createdAt: new Date('2023-03-10'),
        modifiedAt: new Date('2023-03-10'),
        parentId: '3',
        path: []
      },
      {
        id: '12',
        name: 'Meeting Recording',
        type: FileType.Video,
        extension: 'webm',
        size: 18000000,
        createdAt: new Date('2023-03-05'),
        modifiedAt: new Date('2023-03-05'),
        parentId: '3',
        path: []
      },
      {
        id: '13',
        name: 'App Source Code',
        type: FileType.Code,
        extension: 'zip',
        size: 8500000,
        createdAt: new Date('2023-04-01'),
        modifiedAt: new Date('2023-04-10'),
        parentId: '4',
        path: []
      },
      {
        id: '14',
        name: 'Website Backup',
        type: FileType.Archive,
        extension: 'tar.gz',
        size: 12000000,
        createdAt: new Date('2023-04-05'),
        modifiedAt: new Date('2023-04-05'),
        parentId: '4',
        path: []
      }
    ];

    this.folders.next([documents, images, videos, projects]);
    this.files.next(files);
  }

  private sortItems(items: (FileItem | FolderItem)[]): (FileItem | FolderItem)[] {
    const { sortBy, sortDirection } = this.viewOptions.value;
  
    return [...items]
      .filter(item => item && item.name)
      .sort((a, b) => {
        if (!a || !b || !a.name || !b.name) return 0;
        const aIsFolder = 'children' in a;
        const bIsFolder = 'children' in b;
        
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
  
        let result = 0;
  
        switch (sortBy) {
          case 'name':
            result = a.name.localeCompare(b.name);
            break;
          case 'date':
            result = a.modifiedAt.getTime() - b.modifiedAt.getTime();
            break;
          case 'type':
            if (!aIsFolder && !bIsFolder) {
              result = (a as FileItem).extension.localeCompare((b as FileItem).extension);
            }
            break;
          case 'size':
            if (!aIsFolder && !bIsFolder) {
              result = (a as FileItem).size - (b as FileItem).size;
            }
            break;
        }
  
        return sortDirection === 'asc' ? result : -result;
      });
  }
  

  private deleteFolder(folderId: string): void {
    const folderToDelete = this.folders.value.find(f => f.id === folderId);
    if (!folderToDelete) return;

    if (folderToDelete.parentId) {
      this.removeFolderChild(folderToDelete.parentId, folderId);
    }

    const childFolders = this.folders.value.filter(f => f.parentId === folderId);
    const childFiles = this.files.value.filter(f => f.parentId === folderId);

    childFolders.forEach(folder => this.deleteFolder(folder.id));

    const updatedFiles = this.files.value.filter(file => file.parentId !== folderId);
    this.files.next(updatedFiles);

    const updatedFolders = this.folders.value.filter(folder => folder.id !== folderId);
    this.folders.next(updatedFolders);
  }

  private updateFolderChildren(folderId: string, childId: string): void {
    const updatedFolders = this.folders.value.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          children: [...folder.children, childId],
          modifiedAt: new Date()
        };
      }
      return folder;
    });

    this.folders.next(updatedFolders);
  }

  private removeFolderChild(folderId: string, childId: string): void {
    const updatedFolders = this.folders.value.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          children: folder.children.filter(id => id !== childId),
          modifiedAt: new Date()
        };
      }
      return folder;
    });

    this.folders.next(updatedFolders);
  }

  public downloadFile(fileId: string): void {
    const file = this.files.value.find(f => f.id === fileId);
    if (!file) return;

    const blob = new Blob([`Fake content of ${file.name}`], { type: 'text/plain' }); // Replace with real content
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name + '.' + file.extension;
    a.click();
    URL.revokeObjectURL(url);
  }


  private updateFolderAndChildrenPaths(folder: FolderItem, newPath: string[], newParentId: string | null): void {
    // Update the folder itself
    const updatedFolders = this.folders.value.map(f => {
      if (f.id === folder.id) {
        return {
          ...f,
          path: newPath,
          parentId: newParentId,
          modifiedAt: new Date()
        };
      }
      return f;
    });

    this.folders.next(updatedFolders);

    // Update all child folders recursively
    const childFolders = this.folders.value.filter(f => f.parentId === folder.id);
    childFolders.forEach(childFolder => {
      this.updateFolderAndChildrenPaths(
        childFolder,
        [...newPath, folder.id],
        folder.id
      );
    });

    // Update all child files
    const updatedFiles = this.files.value.map(file => {
      if (file.parentId === folder.id) {
        return {
          ...file,
          path: [...newPath, folder.id],
          modifiedAt: new Date()
        };
      }
      return file;
    });

    this.files.next(updatedFiles);
  }
}