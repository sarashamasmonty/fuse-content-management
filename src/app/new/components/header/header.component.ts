import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { BreadcrumbItem, FileViewOptions } from '../../models/file.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
  template: `
<header class="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-card dark:bg-transparent">
  <!-- Left: Breadcrumbs -->
  <div class="w-full md:w-auto flex-1">
    <app-breadcrumb></app-breadcrumb>
  </div>

  <!-- Center: Search -->
  <div class="relative w-full md:w-1/3">
    <div class="flex items-center bg-white dark:bg-gray-800 rounded-md shadow-sm px-3 py-2">
      <span class="material-symbols-rounded text-gray-500 mr-2">search</span>
      <input
        type="text"
        class="w-full bg-transparent outline-none text-sm"
        placeholder="Search files and folders..."
        [(ngModel)]="searchQuery"
        (input)="updateSearch()"
      />
      <button
        *ngIf="searchQuery"
        class="text-gray-400 hover:text-gray-600 ml-2"
        (click)="clearSearch()"
      >
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>
  </div>

  <!-- Right: View toggle & sorting -->
  <div class="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto md:justify-end">
    <!-- View Mode -->
    <div class="flex items-center gap-2">
      <button
        class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        [class.bg-gray-200]="viewOptions.viewMode === 'list'"
        (click)="setViewMode('list')"
      >
        <span class="material-symbols-rounded">view_list</span>
      </button>
      <button
        class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        [class.bg-gray-200]="viewOptions.viewMode === 'grid'"
        (click)="setViewMode('grid')"
      >
        <span class="material-symbols-rounded">grid_view</span>
      </button>
    </div>

    <!-- Sort -->
    <div class="flex items-center gap-2">
      <select
        class="text-sm rounded-md border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        [(ngModel)]="viewOptions.sortBy"
        (change)="updateSortOptions()"
      >
        <option value="name">Name</option>
        <option value="type">Type</option>
        <option value="size">Size</option>
        <option value="date">Date</option>
      </select>

      <button
        class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        (click)="toggleSortDirection()"
      >
        <span class="material-symbols-rounded">
          {{ viewOptions.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
        </span>
      </button>
    </div>
  </div>
</header>

  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4);
      background-color: white;
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .header-left, .header-right {
      flex: 1;
    }
    
    .header-center {
      flex: 2;
    }
    
    .header-right {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-4);
    }
    
    /* Search styles */
    .search-container {
      position: relative;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .search-icon {
      position: absolute;
      left: var(--space-3);
      top: 50%;
      transform: translateY(-50%);
      color: var(--neutral-500);
      font-size: 1.25rem;
    }
    
    .search-input {
      width: 100%;
      padding: var(--space-2) var(--space-2) var(--space-2) calc(var(--space-3) * 2 + 1.25rem);
      border-radius: 6px;
      border: 1px solid var(--neutral-300);
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s ease;
    }
    
    .search-input:focus {
      border-color: var(--primary-400);
      box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.2);
    }
    
    .search-clear {
      position: absolute;
      right: var(--space-2);
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--neutral-500);
      cursor: pointer;
      font-size: 1rem;
      padding: 2px;
    }
    
    /* View controls */
    .view-controls {
      display: flex;
      border: 1px solid var(--neutral-300);
      border-radius: 6px;
      overflow: hidden;
    }
    
    .view-button {
      background: white;
      border: none;
      padding: var(--space-1) var(--space-2);
      cursor: pointer;
      color: var(--neutral-600);
      transition: all 0.2s ease;
    }
    
    .view-button:hover {
      background-color: var(--neutral-100);
    }
    
    .view-button.active {
      background-color: var(--neutral-200);
      color: var(--neutral-800);
    }
    
    /* Sort controls */
    .sort-controls {
      display: flex;
      align-items: center;
      border: 1px solid var(--neutral-300);
      border-radius: 6px;
      overflow: hidden;
    }
    
    .sort-select {
      border: none;
      background: white;
      padding: var(--space-1) var(--space-2);
      font-size: 0.875rem;
      color: var(--neutral-800);
      outline: none;
      cursor: pointer;
    }
    
    .sort-direction {
      background: white;
      border: none;
      border-left: 1px solid var(--neutral-300);
      padding: var(--space-1) var(--space-2);
      cursor: pointer;
      color: var(--neutral-600);
      transition: all 0.2s ease;
    }
    
    .sort-direction:hover {
      background-color: var(--neutral-100);
    }
    
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: var(--space-3);
        padding: var(--space-3);
      }
      
      .header-left, .header-center, .header-right {
        width: 100%;
      }
      
      .header-right {
        justify-content: space-between;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  viewOptions: FileViewOptions = {
    viewMode: 'grid',
    sortBy: 'name',
    sortDirection: 'asc',
    filter: null
  };
  
  constructor(private fileService: FileService) {}
  
  ngOnInit(): void {
    this.fileService.getViewOptions().subscribe(options => {
      this.viewOptions = options;
    });
  }
  
  updateSearch(): void {
    const filter = this.searchQuery.trim() !== '' ? this.searchQuery : null;
    this.fileService.updateViewOptions({ filter });
  }
  
  clearSearch(): void {
    this.searchQuery = '';
    this.fileService.updateViewOptions({ filter: null });
  }
  
  setViewMode(mode: 'list' | 'grid'): void {
    this.fileService.updateViewOptions({ viewMode: mode });
  }
  
  updateSortOptions(): void {
    this.fileService.updateViewOptions({ sortBy: this.viewOptions.sortBy });
  }
  
  toggleSortDirection(): void {
    const newDirection = this.viewOptions.sortDirection === 'asc' ? 'desc' : 'asc';
    this.fileService.updateViewOptions({ sortDirection: newDirection });
  }
}