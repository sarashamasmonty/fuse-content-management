import {
  AfterViewInit,
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { FileService } from '../../services/file.service';
import { FileItem, FileType, FolderItem } from '../../models/file.model';
import { FileItemComponent } from '../../components/file-item/file-item.component';
import { ActionBarComponent } from '../../components/action-bar/action-bar.component';
import { CreateFolderDialogComponent } from '../../components/create-folder-dialog/create-folder-dialog.component';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { Observable, BehaviorSubject } from 'rxjs';
import { FilePreviewComponent } from '../file-preview/file-preview.component';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    FileItemComponent,
    ActionBarComponent,
    CreateFolderDialogComponent,
    ContextMenuComponent,
    FilePreviewComponent
  ],
  template: `
<div class="flex flex-col w-full p-4">

  <!-- File View -->
  <div
    [class]="viewMode === 'grid' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2'"
    cdkDropList
    (cdkDropListDropped)="onDrop($event)"
  >
    <ng-container *ngIf="items.length > 0; else emptyState">

      <!-- Grid View -->
      <ng-container *ngIf="viewMode === 'grid'; else listView">
        <div
          *ngFor="let item of items"
          cdkDrag
          [cdkDragData]="item"
          class="draggable-wrapper"
        >
          <app-file-item
            [item]="item"
            [viewMode]="viewMode"
            [isFolder]="isItemFolder(item)"
            [isRenaming]="renamingItemId === item.id"
            (open)="openItem(item)"
            (rename)="handleRename(item, $event)"
            (delete)="deleteItem(item)"
            (move)="startMoveItem(item)"
            (download)="downloadItem(item)"
            (contextMenu)="showContextMenu($event)"
            (dragStart)="onDragStart(item)"
            (dragEnd)="onDragEnd()"
          ></app-file-item>
        </div>
      </ng-container>

      <!-- List View -->
      <ng-template #listView>
        <div
          *ngFor="let item of items"
          cdkDrag
          [cdkDragData]="item"
          class="flex items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <div class="flex items-center gap-3">
            <span class="material-symbols-rounded text-blue-500">
              {{ isItemFolder(item) ? 'folder' : 'description' }}
            </span>
            <span class="text-sm font-medium text-gray-800 dark:text-gray-100">
              {{ item.name }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button class="btn-icon" (click)="openItem(item)" title="Open">
              <span class="material-symbols-rounded text-gray-500 hover:text-blue-600 transition">open_in_new</span>
            </button>
            <button class="btn-icon" (click)="startRenameItem(item)" title="Rename">
              <span class="material-symbols-rounded text-gray-500 hover:text-blue-600 transition">edit</span>
            </button>
            <button class="btn-icon" (click)="startMoveItem(item)" title="Move">
              <span class="material-symbols-rounded text-gray-500 hover:text-blue-600 transition">drive_file_move</span>
            </button>
            <button *ngIf="!isItemFolder(item)" class="btn-icon" (click)="downloadItem(item)" title="Download">
              <span class="material-symbols-rounded text-gray-500 hover:text-blue-600 transition">download</span>
            </button>
            <button class="btn-icon" (click)="deleteItem(item)" title="Delete">
              <span class="material-symbols-rounded text-red-500 hover:text-red-700 transition">delete</span>
            </button>
          </div>
        </div>
      </ng-template>
    </ng-container>

    <!-- Empty State -->
    <ng-template #emptyState>
      <div class="w-full text-center py-12 text-gray-500 dark:text-gray-400">
        <span class="material-symbols-rounded text-6xl mb-4 block">folder_off</span>
        <h3 class="text-xl font-semibold mb-2">No items found</h3>
        <p class="text-sm mb-4">This folder is empty. Create a new folder or upload files to get started.</p>
        <div class="flex flex-wrap justify-center gap-4 mt-4">
          <button class="btn btn-primary flex items-center gap-2" (click)="showCreateFolderDialog()">
            <span class="material-symbols-rounded">create_new_folder</span> New Folder
          </button>
          <button class="btn btn-secondary flex items-center gap-2" (click)="showUploadDialog()">
            <span class="material-symbols-rounded">upload_file</span> Upload Files
          </button>
        </div>
      </div>
    </ng-template>
  </div>

  <!-- Create Folder Dialog -->
  <app-create-folder-dialog
    [isVisible]="showDialog"
    [isRenaming]="isRenaming"
    [initialName]="currentItemName"
    (cancel)="hideDialog()"
    (confirm)="confirmDialog($event)"
  ></app-create-folder-dialog>

  <!-- Context Menu -->
  <app-context-menu
    [isVisible]="(showContextMenu$ | async) ?? false"
    [posX]="contextMenuX"
    [posY]="contextMenuY"
    [menuItems]="contextMenuItems"
    (itemClick)="handleContextMenuAction($event)"
    (close)="closeContextMenu()"
  ></app-context-menu>

  <!-- Hidden File Input -->
  <input
    id="file-upload-input"
    type="file"
    class="hidden"
    (change)="onFileSelected($event)"
    [attr.accept]="acceptedFileTypes"
    multiple
  />

  <!-- File Preview -->
  <app-file-preview
    *ngIf="selectedFile"
    [file]="selectedFile"
    (closePreview)="selectedFile = null"
  ></app-file-preview>

  <!-- Folder Picker Dialog -->
  <div *ngIf="showFolderPicker" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl shadow-lg p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Move to Folder</h2>
      <ul class="space-y-2 max-h-60 overflow-auto">
        <li
          *ngFor="let folder of availableFolders"
          (click)="confirmMove(folder.id)"
          class="cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
        >
          📁 {{ folder.name }}
        </li>
      </ul>
      <div class="flex justify-end mt-6">
        <button
          class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          (click)="cancelMove()"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
`,
  styles: [`
    .btn-icon {
      @apply p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700;
    }
  `]
})
export class FilesComponent implements OnInit, AfterViewInit {
  items: (FileItem | FolderItem)[] = [];
  viewMode: 'grid' | 'list' = 'list';
  currentFolderId: string | null = null;

  showDialog = false;
  isRenaming = false;
  currentItemName = '';
  currentItem: FileItem | FolderItem | null = null;
  renamingItemId: string | null = null;

  dragTarget: string | null = null;
  showContextMenu$ = new BehaviorSubject<boolean>(false);
  contextMenuX = 0;
  contextMenuY = 0;
  contextSelectedItem: FileItem | FolderItem | null = null;
  contextMenuItems: Array<{ label: string; action: string; icon: string; isDanger?: boolean }> = [];

  acceptedFileTypes = '.jpg,.jpeg,.png,.pdf,.docx,.pptx,.xlsx,.zip,.mp4,.txt';
  selectedFile: FileItem | null = null;
  uploadInputRef!: HTMLInputElement;

  showFolderPicker = false;
  availableFolders: FolderItem[] = [];
  itemToMove: FileItem | FolderItem | null = null;

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.loadCurrentFolder();
    this.fileService.getViewOptions().subscribe(options => {
      this.viewMode = options.viewMode;
    });
  }

  ngAfterViewInit(): void {
    this.uploadInputRef = document.querySelector('#file-upload-input') as HTMLInputElement;
  }

  isDescendantOrSelf(target: FolderItem, source: FileItem | FolderItem): boolean {
    if (!('children' in source)) return false;
    if (target.id === source.id) return true;
    return target.path.includes(source.id);
  }
  

  loadCurrentFolder(): void {
    this.fileService.getCurrentFolder().subscribe(folder => {
      this.currentFolderId = folder?.id ?? null;
      this.fileService.getAllFilesAndFolders(this.currentFolderId).subscribe(items => {
        this.items = items;
      });
    });
  }

  isItemFolder(item: FileItem | FolderItem): boolean {
    return 'children' in item;
  }

  openItem(item: FileItem | FolderItem): void {
    if (this.isItemFolder(item)) {
      this.fileService.navigateToFolder(item.id);
    } else {
      this.selectedFile = item as FileItem;
    }
  }

  showCreateFolderDialog(): void {
    this.isRenaming = false;
    this.currentItem = null;
    this.currentItemName = '';
    this.showDialog = true;
  }

  startRenameItem(item: FileItem | FolderItem): void {
    this.isRenaming = true;
    this.currentItem = item;
    this.currentItemName = item.name;
    this.showDialog = true;
  }

  handleRename(item: FileItem | FolderItem, newName: string): void {
    const isFolder = this.isItemFolder(item);
    this.fileService.renameItem(item.id, newName, isFolder);
    this.renamingItemId = null;
    this.loadCurrentFolder();
  }

  confirmDialog(name: string): void {
    if (this.isRenaming && this.currentItem) {
      const isFolder = this.isItemFolder(this.currentItem);
      this.fileService.renameItem(this.currentItem.id, name, isFolder);
    } else {
      this.fileService.createFolder(name, this.currentFolderId);
    }

    this.hideDialog();
    this.loadCurrentFolder();
  }

  hideDialog(): void {
    this.showDialog = false;
  }

  deleteItem(item: FileItem | FolderItem): void {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.fileService.deleteItem(item.id, this.isItemFolder(item));
      this.loadCurrentFolder();
    }
  }

  showUploadDialog(): void {
    this.uploadInputRef?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      this.fileService.uploadFile(file, this.currentFolderId);
    });

    this.loadCurrentFolder();
  }

  downloadItem(item: FileItem | FolderItem): void {
    if (this.isItemFolder(item)) return;
    this.fileService.downloadFile(item.id);
  }

  startMoveItem(item: FileItem | FolderItem): void {
    this.itemToMove = item;
    this.fileService.getFolders(null).subscribe(folders => {
      const allFolders: FolderItem[] = [...folders];
  
      // Also get nested folders
      this.fileService.getFoldersRecursive().forEach(folder => {
        if (!allFolders.some(f => f.id === folder.id)) {
          allFolders.push(folder);
        }
      });
  
      this.availableFolders = allFolders.filter(f => !this.isDescendantOrSelf(f, item));
      this.showFolderPicker = true;
    });
  }
  

  cancelMove(): void {
    this.showFolderPicker = false;
    this.itemToMove = null;
  }

  confirmMove(targetFolderId: string): void {
    if (!this.itemToMove) return;

    const isFolder = this.isItemFolder(this.itemToMove);
    this.fileService.moveItem(this.itemToMove.id, isFolder, targetFolderId);
    this.loadCurrentFolder();
    this.cancelMove();
  }

  showContextMenu(event: { event: MouseEvent; item: FileItem | FolderItem }): void {
    this.contextSelectedItem = event.item;
    this.contextMenuX = event.event.clientX;
    this.contextMenuY = event.event.clientY;

    const isFolder = this.isItemFolder(event.item);
    this.contextMenuItems = [
      { label: 'Open', action: 'open', icon: 'open_in_new' },
      { label: 'Rename', action: 'rename', icon: 'edit' },
      { label: 'Move', action: 'move', icon: 'drive_file_move' },
      ...(!isFolder ? [{ label: 'Download', action: 'download', icon: 'download' }] : []),
      { label: 'Delete', action: 'delete', icon: 'delete', isDanger: true }
    ];

    this.showContextMenu$.next(true);
  }

  closeContextMenu(): void {
    this.showContextMenu$.next(false);
  }

  handleContextMenuAction(action: string): void {
    if (!this.contextSelectedItem) return;

    switch (action) {
      case 'open':
        this.openItem(this.contextSelectedItem);
        break;
      case 'rename':
        this.startRenameItem(this.contextSelectedItem);
        break;
      case 'move':
        this.startMoveItem(this.contextSelectedItem);
        break;
      case 'download':
        if (!this.isItemFolder(this.contextSelectedItem)) {
          this.downloadItem(this.contextSelectedItem as FileItem);
        }
        break;
      case 'delete':
        this.deleteItem(this.contextSelectedItem);
        break;
    }

    this.closeContextMenu();
  }

  onDragStart(item: FileItem | FolderItem): void {
    if (this.isItemFolder(item)) {
      this.dragTarget = item.id;
    }
  }

  onDragEnd(): void {
    this.dragTarget = null;
  }

  onDrop(event: CdkDragDrop<any>): void {
    const draggedItem = event.item.data as FileItem | FolderItem;
    const targetFolder = this.items.find(
      item => item.id === this.dragTarget && this.isItemFolder(item)
    );

    if (!targetFolder || !draggedItem || draggedItem.id === targetFolder.id) return;

    this.fileService.moveItem(draggedItem.id, this.isItemFolder(draggedItem), targetFolder.id);
    this.loadCurrentFolder();
  }
}
