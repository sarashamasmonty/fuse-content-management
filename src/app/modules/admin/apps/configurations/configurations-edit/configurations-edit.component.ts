// src/app/modules/admin/apps/configurations/configurations-edit.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfigurationsService } from '../configurations.service';
import { Application } from '../configurations.types';

@Component({
  selector: 'app-configurations-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h2 class="text-2xl mb-4">
        {{ isNew ? 'New Application' : 'Edit Application' }}
      </h2>

      <form *ngIf="loaded" class="space-y-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Reference</mat-label>
          <input matInput [(ngModel)]="app.reference" name="reference" [disabled]="!isNew" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Code</mat-label>
          <input matInput [(ngModel)]="app.applicationCode" name="applicationCode" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="app.name" name="name" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Description</mat-label>
          <textarea matInput rows="3" [(ngModel)]="app.description" name="description"></textarea>
        </mat-form-field>

        <div class="flex justify-end space-x-2">
          <button mat-stroked-button (click)="onCancel()">Cancel</button>
          <button mat-flat-button color="primary" (click)="onSave()" [disabled]="!isValid()">Save</button>
        </div>
      </form>
    </div>
  `
})
export class ConfigurationsEditComponent implements OnInit {
  app: Partial<Application> = {};
  loaded = false;
  isNew = false;

  constructor(
    private svc: ConfigurationsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const state = history.state as { app?: Application };
    const ref = this.route.snapshot.paramMap.get('appRef');
    this.isNew = !ref;

    if (state.app) {
      // use passed-in data
      this.app = { ...state.app };
      this.loaded = true;
    } else if (ref) {
      // fallback: no GET support, redirect back
      this.router.navigate(['/configurations']);
      return;
    } else {
      // new application
      this.app = { reference: '', applicationCode: '', name: '', description: '' };
      this.loaded = true;
    }
  }

  isValid() {
    return !!(
      this.app.reference &&
      this.app.applicationCode &&
      this.app.name &&
      this.app.description
    );
  }

  onSave() {
    const payload = {
      reference: this.app.reference!,
      applicationCode: this.app.applicationCode!,
      name: this.app.name!,
      description: this.app.description!
    };

    const obs = this.isNew
      ? this.svc.createApplication(payload)
      : this.svc.updateApplication(payload.reference, payload);

    obs.subscribe(() => this.router.navigate(['/configurations']));
  }

  onCancel() {
    this.router.navigate(['/configurations']);
  }
}
