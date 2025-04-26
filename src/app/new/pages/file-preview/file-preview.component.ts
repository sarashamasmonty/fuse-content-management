import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileItem, FileType } from '../../models/file.model';

@Component({
  selector: 'app-file-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
<!-- Overlay -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
  *ngIf="file"
  (click)="close()"
>
  <!-- Modal Container -->
  <div
    class="relative w-1/2 max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden"
    (click)="$event.stopPropagation()"
  >
    <!-- Close Button -->
    <button
      class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl"
      (click)="close()"
      aria-label="Close"
    >
      &times;
    </button>

    <!-- Header -->
    <div class="px-6 pt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
        {{ file.name }}.{{ file.extension }}
      </h2>
    </div>

    <!-- Preview Content -->
    <div class="p-6 max-h-[75vh] overflow-auto">
      <ng-container [ngSwitch]="file.type">
        <!-- Image Preview -->
        <img
          *ngSwitchCase="FileType.Image"
          [src]="fileUrl"
          [alt]="file.name"
          class="w-full max-h-[60vh] object-contain rounded"
        />

        <!-- Video Preview -->
        <video
          *ngSwitchCase="FileType.Video"
          [src]="fileUrl"
          controls
          class="w-full max-h-[60vh] rounded"
        ></video>

        <!-- Document Preview (iframe) -->
        <iframe
          *ngSwitchCase="FileType.Document"
          [src]="fileUrl"
          class="w-full h-[60vh] border border-gray-300 dark:border-gray-700 rounded"
        ></iframe>

        <!-- Generic Preview -->
        <pre
          *ngSwitchDefault
          class="bg-gray-100 dark:bg-gray-800 text-sm p-4 rounded overflow-x-auto"
        >
{{ file.name }}.{{ file.extension }}
        </pre>
      </ng-container>
    </div>
  </div>
</div>
  `,
})
export class FilePreviewComponent {
  @Input() file!: FileItem;
  @Output() closePreview = new EventEmitter<void>();

  FileType = FileType;

  get fileUrl(): string {
    // In real use: return a URL from backend or blob
    return `assets/demo-files/${this.file.name}.${this.file.extension}`;
  }

  close(): void {
    this.closePreview.emit();
  }
}
