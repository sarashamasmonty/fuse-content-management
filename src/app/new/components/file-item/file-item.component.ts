import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileItem, FileType, FolderItem } from '../../models/file.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<!-- File Item Wrapper -->
<div
  class="group relative cursor-pointer rounded-md transition hover:bg-gray-50 dark:hover:bg-gray-800"
  [ngClass]="{
    'w-full p-3 flex items-center gap-4 border border-gray-200 dark:border-gray-700': viewMode === 'list',
    'flex flex-col items-center text-center p-4 border border-gray-200 dark:border-gray-700 w-[150px] ': viewMode === 'grid'
  }"
  (click)="itemClick()"
  (contextmenu)="onContextMenu($event)"
>

  <!-- Icon -->
  <div
    class="flex items-center justify-center text-4xl text-blue-600 dark:text-blue-400"
    [ngClass]="{
      'w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded-md': viewMode === 'list',
      'mb-2 text-5xl': viewMode === 'grid'
    }"
  >
    <span class="material-symbols-rounded">{{ getItemIcon() }}</span>
  </div>

  <!-- Details -->
  <div
    class="flex flex-col flex-1"
    [ngClass]="{
      'overflow-hidden': viewMode === 'list',
      'items-center w-full': viewMode === 'grid'
    }"
  >

    <!-- Name or Rename Input -->
    <div class="font-medium text-sm truncate text-gray-800 dark:text-white w-full">
      <ng-container *ngIf="!isRenaming; else renameInput">
        {{ item.name }}
      </ng-container>
      <ng-template #renameInput>
        <input
          type="text"
          [(ngModel)]="renameInputValue"
          (blur)="submitRename()"
          (keydown.enter)="submitRename()"
          class="px-2 py-1 text-sm w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring focus:ring-blue-500"
          autofocus
        />
      </ng-template>
    </div>

    <!-- List Mode Only: Meta Info -->
    <div
      *ngIf="viewMode === 'list' && !isFolder"
      class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex gap-3"
    >
      <span>{{ getFileExtension() }}</span>
      <span>{{ getFileSize() }}</span>
    </div>

    <!-- List Mode Only: Modified Date -->
    <div
      *ngIf="viewMode === 'list'"
      class="text-xs text-gray-400 mt-1"
    >
      {{ item.modifiedAt | date: 'MMM d, y' }}
    </div>
  </div>

  <!-- Actions (list only) -->
  <div
    *ngIf="viewMode === 'list'"
    class="flex gap-2 items-center ml-auto"
    (click)="$event.stopPropagation()"
  >
    <button
      class="text-xs text-blue-600 hover:underline"
      (click)="toggleRename($event)"
    >
      Rename
    </button>
    <button
      class="text-gray-400 hover:text-red-500"
      (click)="onDelete($event)"
    >
      <span class="material-symbols-rounded text-base">delete</span>
    </button>
  </div>
</div>
  `,
})
export class FileItemComponent {
  @Input() item!: FileItem | FolderItem;
  @Input() viewMode: 'list' | 'grid' = 'grid';
  @Input() isFolder: boolean = false;

  @Output() open = new EventEmitter<void>();
  @Output() rename = new EventEmitter<string>();
  @Output() delete = new EventEmitter<void>();
  @Output() contextMenu = new EventEmitter<{ event: MouseEvent; item: FileItem | FolderItem }>();

  isRenaming = false;
  renameInputValue = '';

  itemClick(): void {
    if (!this.isRenaming) {
      this.open.emit();
    }
  }

  toggleRename(event: MouseEvent): void {
    event.stopPropagation();
    this.isRenaming = true;
    this.renameInputValue = this.item.name;
  }

  submitRename(): void {
    const trimmed = this.renameInputValue.trim();
    if (trimmed && trimmed !== this.item.name) {
      this.rename.emit(trimmed);
    }
    this.isRenaming = false;
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit();
  }

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.contextMenu.emit({ event, item: this.item });
  }

  getItemIcon(): string {
    if (this.isFolder) return 'folder';

    const fileItem = this.item as FileItem;
    switch (fileItem.type) {
      case FileType.Document:
        return 'description';
      case FileType.Image:
        return 'image';
      case FileType.Video:
        return 'movie';
      case FileType.Audio:
        return 'audio_file';
      case FileType.Archive:
        return 'folder_zip';
      case FileType.Code:
        return 'code';
      default:
        return 'insert_drive_file';
    }
  }

  getFileExtension(): string {
    return !this.isFolder ? (this.item as FileItem).extension.toUpperCase() : '';
  }

  getFileSize(): string {
    return !this.isFolder ? this.formatFileSize((this.item as FileItem).size) : '';
  }

  formatFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
}
