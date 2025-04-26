// src/app/components/folder-picker-dialog/folder-picker-dialog.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderItem } from '../../models/file.model';

@Component({
  selector: 'app-folder-picker-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div *ngIf="isVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-lg">
      <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Select Destination Folder</h2>
      <ul class="flex flex-col gap-2 max-h-60 overflow-auto">
        <li
          *ngFor="let folder of folders"
          (click)="select(folder.id)"
          class="cursor-pointer px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
        >
          📁 {{ folder.name }}
        </li>
      </ul>

      <div class="mt-6 flex justify-end gap-3">
        <button class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600" (click)="close.emit()">
          Cancel
        </button>
      </div>
    </div>
  </div>
  `
})
export class FolderPickerDialogComponent {
  @Input() isVisible = false;
  @Input() folders: FolderItem[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string>();

  select(folderId: string): void {
    this.confirm.emit(folderId);
  }
}
