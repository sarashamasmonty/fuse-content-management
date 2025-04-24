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
import { FileManagerDetailsComponent } from "../details/details.component";

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
        DatePipe, MatFormFieldModule, ReactiveFormsModule, FormsModule,
        
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

        // Get the items
        this._fileManagerService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: Items) => {
                this.items = items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the item
        this._fileManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: Item) => {
                this.selectedItem = item;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to media query change
        this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {
                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
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
                return 'heroicons_solid:document-text';
            case 'doc':
            case 'docx':
                return 'heroicons_solid:document';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'heroicons_solid:photograph'; // Assuming you have image previews for these
            default:
                return 'heroicons_solid:document'; // Default file icon
        }
    }
    
    getFileBadgeClass(fileType: string): string {
        switch ((fileType || '').toLowerCase()) {
            case 'pdf': return 'bg-red-500';  // Red for PDF files
            case 'doc':
            case 'docx': return 'bg-blue-500'; // Blue for Word files
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return 'bg-amber-500'; // Amber for image files
            default: return 'bg-gray-500';  // Gray for other file types
        }
    }

    openFolder(folder: Item): void {
        this.selectedItem = folder;
        this.matDrawer.open();
    }

    openFile(file: Item): void {
        this.selectedItem = file;
        this.matDrawer.open();
    }

    openItemInDrawer(item: Item): void {
        this._router.navigate([{ outlets: { drawer: ['details', item.id] } }], {
            relativeTo: this._activatedRoute,
        });
    }



}
