// src/app/modules/admin/apps/configurations/app-properties.component.ts

import { Component, OnInit, Inject }            from '@angular/core';
import { ActivatedRoute }                        from '@angular/router';
import { Location }                              from '@angular/common';
import { CommonModule }                          from '@angular/common';
import { FormsModule }                           from '@angular/forms';
import { MatIconModule }                         from '@angular/material/icon';
import { MatButtonModule }                       from '@angular/material/button';
import { MatCardModule }                         from '@angular/material/card';
import { MatFormFieldModule }                    from '@angular/material/form-field';
import { MatSelectModule }                       from '@angular/material/select';
import { MatTableModule, MatTableDataSource }    from '@angular/material/table';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatInputModule }                        from '@angular/material/input';

import { ConfigurationsService, Profile }        from '../configurations.service';
import { ApplicationProperty }                   from '../configurations.types';

/** Simple confirmation dialog **/
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

/** Component for listing/adding/editing properties **/
@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatDialogModule,
    MatInputModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card class="shadow-lg">
        <mat-card-header class="flex items-center space-x-4">
          <button mat-icon-button (click)="back()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <mat-card-title class="text-lg font-semibold">
            Properties for <span class="font-mono">{{ appRef }}</span>
          </mat-card-title>
          <span class="flex-1"></span>
          <button mat-flat-button color="primary" (click)="onAdd()">Add Property</button>
        </mat-card-header>

        <mat-card-content class="space-y-4">
          <!-- Profile selector -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <mat-form-field appearance="outline" class="w-full sm:w-1/3">
              <mat-label>Profile</mat-label>
              <mat-select [(ngModel)]="selectedProfile" (selectionChange)="loadProps()">
                <mat-option *ngFor="let p of profiles" [value]="p.name">{{ p.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-stroked-button (click)="exportProps()" [disabled]="!dataSource.data.length">
              Export ZIP
            </button>
          </div>

          <!-- Inline form for new/edit -->
          <section *ngIf="showForm" class="p-4 border rounded bg-gray-50 dark:bg-gray-800">
            <h3 class="font-medium mb-2">{{ editing ? 'Edit' : 'New' }} Property</h3>
            <form class="space-y-2">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Key</mat-label>
                <input matInput [(ngModel)]="form.key"   name="key"   />
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Label</mat-label>
                <input matInput [(ngModel)]="form.label" name="label" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Value</mat-label>
                <input matInput [(ngModel)]="form.value" name="value" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Type</mat-label>
                <input matInput [(ngModel)]="form.type"  name="type"  />
              </mat-form-field>
              <div class="flex justify-end space-x-2">
                <button mat-button (click)="onCancel()">Cancel</button>
                <button
                  mat-flat-button
                  color="primary"
                  (click)="onSave()"
                  [disabled]="!form.key||!form.label||!form.value||!form.type"
                >
                  {{ editing ? 'Update' : 'Create' }}
                </button>
              </div>
            </form>
          </section>

          <!-- Properties table -->
          <div class="overflow-x-auto">
            <table
              mat-table
              [dataSource]="dataSource"
              class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            >
              <ng-container matColumnDef="key">
                <th mat-header-cell *matHeaderCellDef class="sticky top-0 bg-gray-50 px-4 py-2 uppercase text-sm">
                  Key
                </th>
                <td mat-cell *matCellDef="let p" class="px-4 py-2 odd:bg-white even:bg-gray-50">
                  {{ p.key }}
                </td>
              </ng-container>
              <ng-container matColumnDef="label">
                <th mat-header-cell *matHeaderCellDef class="sticky top-0 bg-gray-50 px-4 py-2 uppercase text-sm">
                  Label
                </th>
                <td mat-cell *matCellDef="let p" class="px-4 py-2 odd:bg-white even:bg-gray-50">
                  {{ p.label }}
                </td>
              </ng-container>
              <ng-container matColumnDef="value">
                <th mat-header-cell *matHeaderCellDef class="sticky top-0 bg-gray-50 px-4 py-2 uppercase text-sm">
                  Value
                </th>
                <td mat-cell *matCellDef="let p" class="px-4 py-2 odd:bg-white even:bg-gray-50">
                  {{ p.value }}
                </td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef class="sticky top-0 bg-gray-50 px-4 py-2 uppercase text-sm">
                  Type
                </th>
                <td mat-cell *matCellDef="let p" class="px-4 py-2 odd:bg-white even:bg-gray-50">
                  {{ p.type }}
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="sticky top-0 bg-gray-50 px-4 py-2 uppercase text-sm">
                  Actions
                </th>
                <td mat-cell *matCellDef="let p" class="px-4 py-2 flex space-x-2">
                  <button mat-icon-button (click)="onEdit(p)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button (click)="onDelete(p)"><mat-icon color="warn">delete</mat-icon></button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AppPropertiesComponent implements OnInit {
  appRef!: string;
  profiles: Profile[] = [];
  selectedProfile!: string;
  dataSource = new MatTableDataSource<ApplicationProperty>();
  cols = ['key','label','value','type','actions'];

  showForm = false;
  editing  = false;
  form: Partial<ApplicationProperty & { type: string }> = {};

  constructor(
    private route: ActivatedRoute,
    private configSvc: ConfigurationsService,
    private dialog: MatDialog,
    private location: Location
  ) {}

  ngOnInit() {
    this.appRef = this.route.snapshot.paramMap.get('appRef')!;
    this.configSvc.getProfiles().subscribe(ps => {
      this.profiles = ps;
      this.selectedProfile = ps[0]?.name || '';
      this.loadProps();
    });
  }

  back() {
    this.location.back();
  }

  loadProps() {
    this.configSvc
      .getPropertiesByProfile(this.appRef, this.selectedProfile)
      .subscribe(props => {
        this.dataSource.data = props;
        this.dataSource._updateChangeSubscription();
      });
  }

  exportProps() {
    this.configSvc
      .exportProperties(this.appRef, this.selectedProfile)
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href    = url;
        a.download= `${this.appRef}-${this.selectedProfile}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  onAdd() {
    this.showForm = true;
    this.editing  = false;
    this.form     = { key:'', label:'', value:'', type:'' };
  }

  onEdit(p: ApplicationProperty) {
    this.showForm = true;
    this.editing  = true;
    this.form     = { ...p };
  }

  onCancel() {
    this.showForm = false;
    this.editing  = false;
  }

  onSave() {
    const payload = {
      profile: this.selectedProfile,
      key:     '',
      label:   this.form.label!,
      value:   this.form.value!,
      type:    this.form.type!
    };

    let op$ = this.editing
      ? this.configSvc.updateProperty(this.appRef, this.form.reference!, payload)
      : this.configSvc.addProperty(this.appRef, payload);

    op$.subscribe(() => {
      this.onCancel();
      this.loadProps();
    });
  }

  onDelete(p: ApplicationProperty) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Property', message: `Delete "${p.label}"?` }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.configSvc.deleteProperty(this.appRef, p.reference!).subscribe(() => this.loadProps());
    });
  }
}
