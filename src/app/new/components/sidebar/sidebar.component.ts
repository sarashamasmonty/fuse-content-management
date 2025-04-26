import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FileService } from '../../services/file.service';
import { FolderItem } from '../../models/file.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<aside class="w-full md:w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-card dark:bg-transparent p-4">
  <nav class="flex flex-col gap-4">
    <ul class="flex flex-col gap-2 text-sm font-medium text-secondary">

      <!-- Home -->
      <li>
        <button
          (click)="goHome()"
          [ngClass]="{ 'active': isActive('/file-manager-new/files') }"
          class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full text-left"
        >
          <span class="material-symbols-rounded text-base">home</span>
          Home
        </button>
      </li>

      <!-- Dynamic Folder Sections -->
      <li *ngFor="let section of folders">
        <a 
          [routerLink]="['/file-manager-new/folder', section.id]"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <span class="material-symbols-rounded text-base">{{ getFolderIcon(section.name) }}</span>
          {{ section.name }}
        </a>
      </li>

      <!-- Settings -->
      <li>
        <a 
          routerLink="/file-manager-new/settings"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <span class="material-symbols-rounded text-base">settings</span>
          Settings
        </a>
      </li>
    </ul>
  </nav>
</aside>
  `,
  styles: [`
    a.active, button.active {
      background-color: rgba(59, 130, 246, 0.1); /* Tailwind blue-500/10 */
      color: #3b82f6; /* Tailwind text-blue-500 */
      font-weight: 600;
    }
  `]
})
export class SidebarComponent implements OnInit {
  folders: FolderItem[] = [];

  constructor(private router: Router, private fileService: FileService) {}

  ngOnInit(): void {
    // Load only top-level folders
    this.fileService.getFolders(null).subscribe(folders => {
      this.folders = folders;
    });
  }

  goHome(): void {
    this.fileService.navigateToFolder(null);
    this.router.navigate(['/file-manager-new/files']);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  getFolderIcon(name: string): string {
    const map: Record<string, string> = {
      Documents: 'description',
      Images: 'image',
      Videos: 'movie',
      Projects: 'code'
    };
    return map[name] || 'folder';
  }
}
