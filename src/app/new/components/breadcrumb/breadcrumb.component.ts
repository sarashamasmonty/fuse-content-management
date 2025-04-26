import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../../services/file.service';
import { BreadcrumbItem } from '../../models/file.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="w-full flex items-center flex-wrap gap-1 text-sm text-gray-600 dark:text-gray-300">
  <ng-container *ngFor="let item of breadcrumbs; let isLast = last">
    <!-- Item Button -->
    <button
      class="breadcrumb-button flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      [ngClass]="{ 'text-blue-600 dark:text-blue-400 font-semibold cursor-default': isLast }"
      [disabled]="isLast"
      (click)="!isLast && navigateToFolder(item.id)"
    >
      {{ item.name }}
    </button>

    <!-- Chevron -->
    <span *ngIf="!isLast" class="text-gray-400 dark:text-gray-500">
      <span class="material-symbols-rounded text-sm">chevron_right</span>
    </span>
  </ng-container>
</div>
  `
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(private fileService: FileService, private router: Router) {}

  ngOnInit(): void {
    this.fileService.getBreadcrumbs().subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs;
    });
  }

  navigateToFolder(folderId: string | null): void {
    this.fileService.navigateToFolder(folderId);
    const base = '/file-manager-new';
    this.router.navigate(folderId ? [base, 'folder', folderId] : [base, 'files']);
  }
}
