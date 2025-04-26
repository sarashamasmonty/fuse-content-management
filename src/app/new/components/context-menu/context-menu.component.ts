import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
<div
  *ngIf="isVisible"
  class="absolute z-50 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
  [style.left.px]="posX"
  [style.top.px]="posY"
  (click)="$event.stopPropagation()"
>
  <div class="flex flex-col divide-y divide-gray-100 dark:divide-gray-700 py-1">
    <button
      *ngFor="let item of menuItems"
      class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full text-left"
      [ngClass]="{ 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900': item.isDanger }"
      (click)="onItemClick(item.action)"
    >
      <span class="material-symbols-rounded text-base">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </button>
  </div>
</div>

  `,
})
export class ContextMenuComponent implements OnInit, OnDestroy {
  @Input() posX: number = 0;
  @Input() posY: number = 0;
  @Input() isVisible: boolean = false;
  @Input() menuItems: Array<{ label: string; action: string; icon: string; isDanger?: boolean }> = [];
  
  @Output() itemClick = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  
  private clickListener!: EventListener;
  
  constructor(private elementRef: ElementRef) {}
  
  ngOnInit(): void {
    this.clickListener = (event: Event) => {
      if (!this.elementRef.nativeElement.contains(event.target) && this.isVisible) {
        this.close.emit();
      }
    };
    
    document.addEventListener('click', this.clickListener);
    document.addEventListener('contextmenu', this.clickListener);
  }
  
  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickListener);
    document.removeEventListener('contextmenu', this.clickListener);
  }
  
  onItemClick(action: string): void {
    this.itemClick.emit(action);
    this.close.emit();
  }
}