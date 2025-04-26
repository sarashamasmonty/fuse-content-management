// src/app/modules/admin/apps/configurations/configurations.component.ts

import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort as MatSortEvent } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ConfigurationsService } from './configurations.service';
import { Application, Sort } from './configurations.types';

/** Confirmation Dialog **/
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-button color="warn" (click)="dialogRef.close(true)">Delete</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}
}

/** Main Configurations Component **/
@Component({
  selector: 'app-configurations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ConfirmDialogComponent
  ],
  template: `
    <div class="p-4 flex flex-col w-full">
      <!-- HEADER -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Configurations</h1>
        <button mat-flat-button color="primary" (click)="onNew()">New</button>
      </div>

      <!-- SEARCH -->
      <div class="mb-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Search</mat-label>
          <input matInput (keyup)="applyFilter($event.target.value)" placeholder="Type to filter all columns">
        </mat-form-field>
      </div>

      <!-- TABLE WRAPPER -->
      <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table mat-table [dataSource]="dataSource" matSort class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">

          <!-- Reference Column -->
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef mat-sort-header
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference
            </th>
            <td mat-cell *matCellDef="let app"
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
              {{ app.reference }}
            </td>
          </ng-container>

          <!-- Code Column -->
          <ng-container matColumnDef="applicationCode">
            <th mat-header-cell *matHeaderCellDef mat-sort-header
                class="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <td mat-cell *matCellDef="let app"
                class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
              {{ app.applicationCode }}
            </td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <td mat-cell *matCellDef="let app"
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
              {{ app.name }}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
            <td mat-cell *matCellDef="let app"
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
              <div class="flex space-x-2">
                <button mat-icon-button (click)="onEdit(app)" class="hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="onDelete(app)" class="hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <mat-icon>delete</mat-icon>
                </button>
                <button mat-icon-button (click)="openParams(app)" class="hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <mat-icon>tune</mat-icon>
                </button>
                <button mat-icon-button (click)="openProperties(app)" class="hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <mat-icon>settings</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-gray-50 dark:bg-gray-700"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-100 dark:hover:bg-gray-600"></tr>
        </table>
      </div>

      <!-- PAGINATOR -->
      <div class="mt-4">
        <mat-paginator
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5,10,25]"
          showFirstLastButtons
          class="bg-white dark:bg-gray-800 rounded-lg shadow-inner">
        </mat-paginator>
      </div>

      <!-- INLINE FORM -->
      <section *ngIf="showForm" class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">
          {{ isEditing ? 'Edit Application' : 'New Application' }}
        </h2>
        <form class="space-y-4">
          <!-- Reference -->
          <div>
            <label class="block mb-1">Reference</label>
            <input
              type="text"
              [(ngModel)]="formApp.reference"
              name="reference"
              [disabled]="isEditing"
              class="w-full border rounded px-3 py-2"
            />
          </div>
          <!-- Code -->
          <div>
            <label class="block mb-1">Code</label>
            <input
              type="text"
              [(ngModel)]="formApp.applicationCode"
              name="applicationCode"
              class="w-full border rounded px-3 py-2"
            />
          </div>
          <!-- Name -->
          <div>
            <label class="block mb-1">Name</label>
            <input
              type="text"
              [(ngModel)]="formApp.name"
              name="name"
              class="w-full border rounded px-3 py-2"
            />
          </div>
          <!-- Description -->
          <div>
            <label class="block mb-1">Description</label>
            <textarea
              [(ngModel)]="formApp.description"
              name="description"
              rows="3"
              class="w-full border rounded px-3 py-2"
            ></textarea>
          </div>
          <!-- Actions -->
          <div class="flex justify-end space-x-3">
            <button type="button" (click)="onCancel()" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button
              type="button"
              (click)="onSave()"
              [disabled]="
                !formApp.reference ||
                !formApp.applicationCode ||
                !formApp.name ||
                !formApp.description
              "
              class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-700">
              {{ isEditing ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  `
})
export class ConfigurationsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['reference', 'applicationCode', 'name', 'actions'];
  dataSource = new MatTableDataSource<Application>();

  pageSize = 10;
  totalElements = 0;
  currentSort: Sort = Sort.Empty;

  showForm = false;
  isEditing = false;
  formApp: Partial<Application & { description: string }> = {} as any;

  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataSource.filterPredicate = (data: Application, filter: string) => {
      const term = filter.trim().toLowerCase();
      return ['reference', 'applicationCode', 'name']
        .some(key => (data as any)[key]?.toString().toLowerCase().includes(term));
    };
    this.loadPage(0);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe((evt: MatSortEvent) => {
      this.currentSort = evt.direction === 'asc' ? Sort.Asc : Sort.Desc;
      this.paginator.pageIndex = 0;
      this.loadPage(0);
    });
    this.paginator.page.subscribe((e: PageEvent) => this.loadPage(e.pageIndex));
  }

  loadPage(pageIndex: number) {
    this.configSvc.getApplications(pageIndex, this.pageSize, this.currentSort)
      .subscribe(p => {
        this.dataSource.data = p.content;
        this.totalElements = p.totalElements;
        if (this.dataSource.filter) {
          this.dataSource._updateChangeSubscription();
        }
      });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  onEdit(app: Application) {
    this.router.navigate(
      ['/configurations', app.reference, 'edit'],
      { state: { app } }
    );
  }
  
  // and for New:
  onNew() {
    this.router.navigate(['/configurations/new']);
  }

  onCancel() {
    this.showForm = false;
    this.isEditing = false;
  }

  onSave() {
    const payload = {
      reference: this.formApp.reference!,
      applicationCode: this.formApp.applicationCode!,
      name: this.formApp.name!,
      description: this.formApp.description!
    };

    if (this.isEditing) {
      this.configSvc.updateApplication(payload.reference, payload)
        .subscribe(() => {
          this.showForm = false;
          this.loadPage(this.paginator.pageIndex);
        });
    } else {
      this.configSvc.createApplication(payload)
        .subscribe(() => {
          this.showForm = false;
          this.loadPage(this.paginator.pageIndex);
        });
    }
  }

  onDelete(app: Application) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${app.name}"?`
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.configSvc.deleteApplication(app.reference)
          .subscribe(() => this.loadPage(this.paginator.pageIndex));
      }
    });
  }

  openParams(app: Application) {
    this.router.navigate([`/configurations/${app.reference}/parameters`]);
  }

  openProperties(app: Application) {
    this.router.navigate([`/configurations/${app.reference}/properties`]);
  }
}
