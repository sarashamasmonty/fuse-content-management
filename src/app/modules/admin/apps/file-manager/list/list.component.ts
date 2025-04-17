import { NgFor, NgIf, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/file-manager.service';
import { Item, Items } from 'app/modules/admin/apps/file-manager/file-manager.types';
import { Subject, takeUntil } from 'rxjs';
import { AddFolderDialogComponent } from '../add-folder-dialog/add-folder-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'file-manager-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        RouterOutlet,
        NgIf,
        RouterLink,
        NgFor,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        DatePipe, MatFormFieldModule, ReactiveFormsModule, FormsModule
    ],
})
export class FileManagerListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    selectedItem: Item;
    items: Items;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fileManagerService: FileManagerService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this._fileManagerService.getFolders();
        this._fileManagerService.getDocuments('/');

        this._fileManagerService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: Items) => {
                this.items = items;
                this._changeDetectorRef.detectChanges();
            });

        this._fileManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: Item) => {
                this.selectedItem = item;
                this._changeDetectorRef.detectChanges();
            });

        this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {
                this.drawerMode = state.matches ? 'side' : 'over';
                this._changeDetectorRef.detectChanges();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.detectChanges();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    addNewFolder(): void {
        const dialogRef = this._dialog.open(AddFolderDialogComponent, {
            width: '400px'
        });

        dialogRef.afterClosed().subscribe(folderName => {
            if (folderName) {
                const payload = { name: folderName, parentPath: '/' };
                this._fileManagerService.addFolder(payload).subscribe(() => {
                    setTimeout(() => {
                        this._fileManagerService.getFolders();
                    }, 300);
                });
            }
        });
    }

    handleFileInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.uploadDocument(event);
        }
    }

    uploadDocument(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const document = {
                parentPath: this.items?.path?.at(-1)?.path || '/',
                name: file.name,
                content: file,
            };
    
            this._fileManagerService.uploadFile(document).subscribe({
                complete: () => {
                    this._fileManagerService.getDocuments(document.parentPath);
                },
                error: (err) => console.error('Upload failed:', err),
            });
        }
    }
    

    getFileIcon(fileType: string): string {
        switch ((fileType || '').toLowerCase()) {
            case 'pdf':
            case 'doc':
            case 'docx':
            case 'xls':
            case 'xlsx':
                return 'heroicons_solid:document-text';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'heroicons_solid:photograph';
            default:
                return 'heroicons_solid:document';
        }
    }

    getFileBadgeClass(fileType: string): string {
        switch ((fileType || '').toLowerCase()) {
            case 'pdf': return 'bg-red-500';
            case 'doc': case 'docx': return 'bg-blue-500';
            case 'xls': case 'xlsx': return 'bg-green-500';
            case 'jpg': case 'jpeg': case 'png': case 'gif': return 'bg-amber-500';
            default: return 'bg-gray-500';
        }
    }

    openFolder(folder: Item): void {
        this._router.navigate(['/file-manager/folders', folder.id]);
        this._fileManagerService.getDocuments(folder.path);
        this._fileManagerService.getItems(folder.path); 
    }
    
}
