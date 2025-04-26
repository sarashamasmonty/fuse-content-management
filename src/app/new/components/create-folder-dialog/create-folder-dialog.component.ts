import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-folder-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<!-- Overlay -->
<div
  class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4 py-8"
  *ngIf="isVisible"
  (click)="onCancel($event)"
>
  <!-- Dialog Container -->
  <div
    class="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 relative"
    (click)="$event.stopPropagation()"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
        {{ isRenaming ? 'Rename Item' : 'Create New Folder' }}
      </h3>
      <button
        class="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
        (click)="onCancel($event)"
        aria-label="Close"
      >
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>

    <!-- Body -->
    <div class="mb-6">
      <label
        for="folderName"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ isRenaming ? 'New Name' : 'Folder Name' }}
      </label>
      <input
        id="folderName"
        type="text"
        [(ngModel)]="itemName"
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="{{ isRenaming ? 'Enter new name' : 'Enter folder name' }}"
        autofocus
      />
    </div>

    <!-- Footer -->
    <div class="flex justify-end gap-2">
      <button
        class="btn btn-secondary"
        (click)="onCancel($event)"
      >
        Cancel
      </button>
      <button
        class="btn btn-primary"
        [disabled]="!itemName.trim()"
        (click)="onSubmit()"
      >
        {{ isRenaming ? 'Rename' : 'Create' }}
      </button>
    </div>
  </div>
</div>

  `,
})
export class CreateFolderDialogComponent {
  @Input() isVisible: boolean = false;
  @Input() isRenaming: boolean = false;
  @Input() initialName: string = '';
  
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string>();
  
  itemName: string = '';
  
  ngOnChanges(): void {
    this.itemName = this.initialName;
  }
  
  onCancel(event: MouseEvent): void {
    event.preventDefault();
    this.cancel.emit();
  }
  
  onSubmit(): void {
    if (this.itemName.trim()) {
      this.confirm.emit(this.itemName);
      this.itemName = '';
    }
  }
}