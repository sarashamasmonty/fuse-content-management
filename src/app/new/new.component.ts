import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ActionBarComponent } from './components/action-bar/action-bar.component';
import { FileService } from './services/file.service';


@Component({
  selector: 'app-file-manager-new',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    BreadcrumbComponent,
    ActionBarComponent,
    MatSidenavModule,
    NgIf,
    RouterLink,
    NgFor,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './new.component.html',
})
export class NewComponent {
  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over' = 'side';

  constructor(private fileService: FileService) {}

  // 👇 Called by ActionBarComponent
  onCreateFolder(): void {
    const folderName = prompt('Enter new folder name:'); // Replace with modal later
    if (folderName?.trim()) {
      const currentFolder = this.fileService['currentFolderId'].value;
      this.fileService.createFolder(folderName.trim(), currentFolder);
    }
  }

  onUploadFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (event: any) => {
      const files: FileList = event.target.files;
      const parentId = this.fileService['currentFolderId'].value;
      Array.from(files).forEach(file => {
        this.fileService.uploadFile(file, parentId);
      });
    };
    input.click();
  }

  onRefresh(): void {
    // This only forces a re-emission if needed, your observables likely auto-update
    const currentId = this.fileService['currentFolderId'].value;
    this.fileService.navigateToFolder(currentId);
  }
}
