import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../../services/file.service';
import { FileItem } from '../../models/file.model';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
<!-- Overlay Background -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" *ngIf="file">
  <!-- Dialog Container -->
  <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
    
    <!-- Header -->
    <div class="flex items-center justify-between border-b pb-3 mb-4">
      <div class="flex items-center gap-3">
        <button
          class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          (click)="goBack()"
        >
          <span class="material-symbols-rounded text-xl">arrow_back</span>
        </button>
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white truncate">
          {{ file.name }}
        </h2>
      </div>

      <div>
        <button
          class="btn btn-secondary flex items-center gap-2"
          (click)="downloadFile()"
        >
          <span class="material-symbols-rounded text-base">download</span>
          Download
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Preview Box -->
      <div class="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-center min-h-[250px]">
        <ng-container [ngSwitch]="file.type">
          <!-- Image -->
          <ng-container *ngSwitchCase="'image'">
            <img
              [src]="file.url || 'https://via.placeholder.com/600x400'"
              [alt]="file.name"
              class="max-w-full max-h-[400px] rounded shadow"
            />
          </ng-container>

          <!-- Document -->
          <ng-container *ngSwitchCase="'document'">
            <div class="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <span class="material-symbols-rounded text-5xl mb-2">description</span>
              <p>Preview not available for {{ file.extension }} files.</p>
            </div>
          </ng-container>

          <!-- Video -->
          <ng-container *ngSwitchCase="'video'">
            <div class="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <span class="material-symbols-rounded text-5xl mb-2">movie</span>
              <p>Video preview not available</p>
            </div>
          </ng-container>

          <!-- Other -->
          <ng-container *ngSwitchDefault>
            <div class="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <span class="material-symbols-rounded text-5xl mb-2">insert_drive_file</span>
              <p>Preview not available for this file type.</p>
            </div>
          </ng-container>
        </ng-container>
      </div>

      <!-- Info Panel -->
      <div class="w-full lg:w-1/3 space-y-4 text-sm">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-white">File Details</h3>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Name</span>
            <span class="text-gray-800 dark:text-white">{{ file.name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Type</span>
            <span class="text-gray-800 dark:text-white">{{ file.extension.toUpperCase() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Size</span>
            <span class="text-gray-800 dark:text-white">{{ formatFileSize(file.size) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Created</span>
            <span class="text-gray-800 dark:text-white">{{ file.createdAt | date: 'medium' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Modified</span>
            <span class="text-gray-800 dark:text-white">{{ file.modifiedAt | date: 'medium' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
})
export class PreviewComponent implements OnInit {
  file: FileItem | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const fileId = params.get('id');
      if (fileId) {
        const file = this.fileService.getItem(fileId, false) as FileItem;
        if (file) {
          this.file = file;
        } else {
          this.router.navigate(['/']);
        }
      }
    });
  }

  goBack(): void {
    if (this.file?.parentId) {
      this.router.navigate(['/folder', this.file.parentId]);
    } else {
      this.router.navigate(['/']);
    }
  }

  downloadFile(): void {
    if (this.file) {
      this.fileService.downloadFile(this.file.id);
    }
  }

  formatFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
}
