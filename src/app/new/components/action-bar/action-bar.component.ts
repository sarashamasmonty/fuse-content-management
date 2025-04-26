import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileType } from '../../models/file.model';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="w-full flex items-center justify-between px-4 md:px-6 py-2 border-b border-gray-200 dark:border-gray-700 bg-card dark:bg-transparent">
  <div class="flex flex-wrap items-center gap-2 sm:gap-4">
    <!-- New Folder Button -->
    <button
      class="btn btn-primary flex items-center gap-2"
      (click)="onCreateFolder()"
    >
      <span class="material-symbols-rounded text-base">create_new_folder</span>
      <span>New Folder</span>
    </button>

    <!-- Upload Button -->
    <button
      class="btn btn-secondary flex items-center gap-2"
      (click)="onUploadFile()"
    >
      <span class="material-symbols-rounded text-base">upload_file</span>
      <span>Upload</span>
    </button>

    <!-- Refresh Button -->
    <button
      class="btn btn-secondary flex items-center"
      (click)="onRefresh()"
      aria-label="Refresh"
    >
      <span class="material-symbols-rounded">refresh</span>
    </button>
  </div>
</div>

  `,
})
export class ActionBarComponent {
  @Output() createFolder = new EventEmitter<void>();
  @Output() uploadFile = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  
  onCreateFolder(): void {
    this.createFolder.emit();
  }
  
  onUploadFile(): void {
    this.uploadFile.emit();
  }
  
  onRefresh(): void {
    this.refresh.emit();
  }
}