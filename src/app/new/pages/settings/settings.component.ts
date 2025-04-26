import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { FileViewOptions } from '../../models/file.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="flex flex-1 w-full relative flex-col px-4 py-6 md:px-6 lg:px-8">
  <!-- Header -->
  <div class="mb-6 border-b pb-4">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>
  </div>

  <!-- Settings Content -->
  <div class="space-y-10">

    <!-- View Preferences Section -->
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-white">View Preferences</h3>

      <!-- Default View Mode -->
      <div class="space-y-2">
        <label class="block font-medium text-sm text-gray-600 dark:text-gray-300">Default View Mode</label>
        <div class="flex items-center gap-6">
          <!-- Grid Option -->
          <div class="flex items-center gap-2">
            <input
              type="radio"
              id="grid-view"
              name="viewMode"
              [value]="'grid'"
              [(ngModel)]="viewOptions.viewMode"
              (change)="updateViewOptions()"
              class="accent-blue-600"
            />
            <label for="grid-view" class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <span class="material-symbols-rounded text-base">grid_view</span>
              Grid
            </label>
          </div>

          <!-- List Option -->
          <div class="flex items-center gap-2">
            <input
              type="radio"
              id="list-view"
              name="viewMode"
              [value]="'list'"
              [(ngModel)]="viewOptions.viewMode"
              (change)="updateViewOptions()"
              class="accent-blue-600"
            />
            <label for="list-view" class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <span class="material-symbols-rounded text-base">view_list</span>
              List
            </label>
          </div>
        </div>
      </div>

      <!-- Sort Files By -->
      <div class="space-y-1">
        <label class="block font-medium text-sm text-gray-600 dark:text-gray-300">Sort Files By</label>
        <select
          class="w-full md:w-60 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
          [(ngModel)]="viewOptions.sortBy"
          (change)="updateViewOptions()"
        >
          <option value="name">Name</option>
          <option value="type">Type</option>
          <option value="size">Size</option>
          <option value="date">Date Modified</option>
        </select>
      </div>

      <!-- Sort Direction -->
      <div class="space-y-2">
        <label class="block font-medium text-sm text-gray-600 dark:text-gray-300">Sort Direction</label>
        <div class="flex items-center gap-6">
          <!-- Ascending -->
          <div class="flex items-center gap-2">
            <input
              type="radio"
              id="sort-asc"
              name="sortDirection"
              [value]="'asc'"
              [(ngModel)]="viewOptions.sortDirection"
              (change)="updateViewOptions()"
              class="accent-blue-600"
            />
            <label for="sort-asc" class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <span class="material-symbols-rounded text-base">arrow_upward</span>
              Ascending
            </label>
          </div>

          <!-- Descending -->
          <div class="flex items-center gap-2">
            <input
              type="radio"
              id="sort-desc"
              name="sortDirection"
              [value]="'desc'"
              [(ngModel)]="viewOptions.sortDirection"
              (change)="updateViewOptions()"
              class="accent-blue-600"
            />
            <label for="sort-desc" class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <span class="material-symbols-rounded text-base">arrow_downward</span>
              Descending
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


  `,
})
export class SettingsComponent {
  viewOptions: FileViewOptions = {
    viewMode: 'grid',
    sortBy: 'name',
    sortDirection: 'asc',
    filter: null
  };
  
  constructor(private fileService: FileService) {
    this.fileService.getViewOptions().subscribe(options => {
      this.viewOptions = { ...options };
    });
  }
  
  updateViewOptions(): void {
    this.fileService.updateViewOptions(this.viewOptions);
  }
}