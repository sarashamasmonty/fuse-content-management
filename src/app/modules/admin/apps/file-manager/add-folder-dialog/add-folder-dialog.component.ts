// add-folder-dialog.component.ts
import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'add-folder-dialog',
    template: `
    <h2 mat-dialog-title>Add New Folder</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Folder Name</mat-label>
        <input matInput [formControl]="nameControl" autofocus />
        <mat-error *ngIf="nameControl.hasError('required')">Name is required</mat-error>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="nameControl.invalid" (click)="save()">Create</button>
    </mat-dialog-actions>
  `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatSidenavModule, NgIf, MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule, MatFormFieldModule, ReactiveFormsModule],
})
export class AddFolderDialogComponent {
    nameControl = new FormControl('', [Validators.required]);

    constructor(
        public dialogRef: MatDialogRef<AddFolderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    save(): void {
        if (this.nameControl.valid) {
            this.dialogRef.close(this.nameControl.value);
        }
    }
}
