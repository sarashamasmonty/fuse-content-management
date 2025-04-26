// src/app/modules/admin/apps/configurations/app-parameters.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }   from '@angular/router';
import { Location }         from '@angular/common';
import { CommonModule }     from '@angular/common';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { MatCardModule }    from '@angular/material/card';
import { MatTableModule }   from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }   from '@angular/material/input';
import { ConfigurationsService } from '../configurations.service';
import { ApplicationParameter } from '../configurations.types';

@Component({
  selector: 'app-parameters',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card class="shadow-lg">
        <mat-card-header class="flex items-center space-x-4">
          <button mat-icon-button (click)="back()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <mat-card-title class="text-lg font-semibold">
            Parameters for <span class="font-mono">{{ appRef }}</span>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="overflow-x-auto">
          <table
            mat-table
            [dataSource]="parameters"
            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          >
            <!-- Name -->
            <ng-container matColumnDef="name">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="bg-gray-50 dark:bg-gray-800 sticky top-0 px-4 py-2 text-left text-sm font-medium uppercase"
              >Name</th>
              <td
                mat-cell
                *matCellDef="let p"
                class="px-4 py-2 text-sm odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800"
              >{{ p.name }}</td>
            </ng-container>
            <!-- Value -->
            <ng-container matColumnDef="value">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="bg-gray-50 dark:bg-gray-800 sticky top-0 px-4 py-2 text-left text-sm font-medium uppercase"
              >Value</th>
              <td
                mat-cell
                *matCellDef="let p"
                class="px-4 py-2 text-sm odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800"
              >{{ p.value }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="['name','value']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['name','value']"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AppParametersComponent implements OnInit {
  appRef!: string;
  parameters: ApplicationParameter[] = [];

  constructor(
    private route: ActivatedRoute,
    private configSvc: ConfigurationsService,
    private location: Location
  ) {}

  ngOnInit() {
    this.appRef = this.route.snapshot.paramMap.get('appRef')!;
    this.configSvc.getParameters(this.appRef)
      .subscribe(p => this.parameters = p);
  }

  back() {
    this.location.back();
  }
}
