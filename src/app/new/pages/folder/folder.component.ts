import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { FileService } from '../../services/file.service';
import { FileItem, FileType, FolderItem } from '../../models/file.model';
import { FileItemComponent } from '../../components/file-item/file-item.component';
import { ActionBarComponent } from '../../components/action-bar/action-bar.component';
import { CreateFolderDialogComponent } from '../../components/create-folder-dialog/create-folder-dialog.component';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-folder',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    FileItemComponent,
    ActionBarComponent,
    CreateFolderDialogComponent,
    ContextMenuComponent
  ],
  template: `
<div class="flex flex-col w-full relative p-4">
  <!-- Grid or List View -->
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
            (open)="openItem(item)"
            (rename)="startRenameItem(item)"
            (delete)="deleteItem(item)"
            (move)="startMoveItem(item)"
            (download)="downloadItem(item)"
            (contextMenu)="showContextMenu($event)"
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
    [isVisible]="showContextMenu$.value"
    [posX]="contextMenuX"
    [posY]="contextMenuY"
    [menuItems]="contextMenuItems"
    (itemClick)="handleContextMenuAction($event)"
    (close)="closeContextMenu()"
  ></app-context-menu>

  <!-- File Input -->
  <input
    #fileInput
    type="file"
    class="hidden"
    multiple
    (change)="onFileSelected($event)"
    [attr.accept]="acceptedFileTypes"
  />
</div>
  `,
  styles: [`
    .btn-icon {
      padding: 0.25rem;
      border-radius: 0.375rem;
      transition: background-color 0.2s;
    }
    .btn-icon:hover {
      background-color: rgba(243, 244, 246, 1); /* Tailwind gray-100 */
    }
    .dark .btn-icon:hover {
      background-color: rgba(31, 41, 55, 1); /* Tailwind dark:gray-700 */
    }
  `]
})
export class FolderComponent implements OnInit, AfterViewInit {
  folderId: string | null = null;
  items: (FileItem | FolderItem)[] = [];
  viewMode: 'grid' | 'list' = 'list';

  showDialog = false;
  isRenaming = false;
  currentItemName = '';
  currentItem: FileItem | FolderItem | null = null;

  showContextMenu$ = new BehaviorSubject<boolean>(false);
  contextMenuX = 0;
  contextMenuY = 0;
  contextSelectedItem: FileItem | FolderItem | null = null;
  contextMenuItems: Array<{ label: string; action: string; icon: string; isDanger?: boolean }> = [];

  acceptedFileTypes = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.pptx,.xlsx,.zip,.mp4,.txt';

  dragTarget: string | null = null;

  @ViewChild('fileInput', { static: true }) fileInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.folderId = params.get('id');
      this.fileService.navigateToFolder(this.folderId);
      this.loadCurrentFolder();
    });

    this.fileService.getViewOptions().subscribe(options => {
      this.viewMode = options.viewMode;
    });
  }

  ngAfterViewInit(): void {}

  loadCurrentFolder(): void {
    this.fileService.getAllFilesAndFolders(this.folderId).subscribe(items => {
      this.items = items;
    });
  }

  isItemFolder(item: FileItem | FolderItem): boolean {
    return 'children' in item;
  }

  openItem(item: FileItem | FolderItem): void {
    if (this.isItemFolder(item)) {
      this.fileService.navigateToFolder(item.id);
    } else {
      this.fileService.downloadFile(item.id);
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

  hideDialog(): void {
    this.showDialog = false;
  }

  confirmDialog(name: string): void {
    if (this.isRenaming && this.currentItem) {
      this.fileService.renameItem(this.currentItem.id, name, this.isItemFolder(this.currentItem));
    } else {
      this.fileService.createFolder(name, this.folderId);
    }

    this.hideDialog();
    this.loadCurrentFolder();
  }

  deleteItem(item: FileItem | FolderItem): void {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.fileService.deleteItem(item.id, this.isItemFolder(item));
      this.loadCurrentFolder();
    }
  }

  showUploadDialog(): void {
    this.fileInputRef?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      this.fileService.uploadFile(file, this.folderId);
    });

    this.loadCurrentFolder();
  }

  downloadItem(item: FileItem): void {
    this.fileService.downloadFile(item.id);
  }

  startMoveItem(item: FileItem | FolderItem): void {
    const targetFolderId = prompt('Enter target folder ID');
    if (targetFolderId) {
      this.fileService.moveItem(item.id, this.isItemFolder(item), targetFolderId);
      this.loadCurrentFolder();
    }
  }

  showContextMenu(event: { event: MouseEvent, item: FileItem | FolderItem }): void {
    this.contextMenuX = event.event.clientX;
    this.contextMenuY = event.event.clientY;
    this.contextSelectedItem = event.item;

    const isFolder = this.isItemFolder(event.item);

    this.contextMenuItems = [
      { label: 'Open', action: 'open', icon: 'open_in_new' },
      { label: 'Rename', action: 'rename', icon: 'edit' },
      { label: 'Move To...', action: 'move', icon: 'drive_file_move' },
      { label: 'Download', action: 'download', icon: 'download' },
      { label: 'Delete', action: 'delete', icon: 'delete', isDanger: true }
    ];

    this.showContextMenu$.next(true);
  }

  closeContextMenu(): void {
    this.showContextMenu$.next(false);
  }

  handleContextMenuAction(action: string): void {
    const item = this.contextSelectedItem;
    if (!item) return;

    switch (action) {
      case 'open':
        this.openItem(item);
        break;
      case 'rename':
        this.startRenameItem(item);
        break;
      case 'delete':
        this.deleteItem(item);
        break;
      case 'move':
        this.startMoveItem(item);
        break;
      case 'download':
        if (!this.isItemFolder(item)) this.downloadItem(item as FileItem);
        break;
    }

    this.closeContextMenu();
  }

  onDrop(event: CdkDragDrop<any>): void {
    const draggedItem = event.item.data as FileItem | FolderItem;
    const targetFolder = this.items.find(
      item => item.id === this.dragTarget && this.isItemFolder(item)
    );
    if (!targetFolder || draggedItem.id === targetFolder.id) return;

    this.fileService.moveItem(draggedItem.id, this.isItemFolder(draggedItem), targetFolder.id);
    this.loadCurrentFolder();
  }
}
