import { Routes } from '@angular/router';
import { NewComponent } from './new.component';

export default [
  {
    path: 'new',
    loadComponent: () =>
      import('./new.component').then((m) => m.NewComponent)
  },
  {

    path: '',
    component: NewComponent,
    children: [
      {
        path: '',
        redirectTo: 'files',
        pathMatch: 'full'
      },

      {
        path: 'files',
        loadComponent: () =>
          import('./pages/files/files.component').then((m) => m.FilesComponent)
      },
      {
        path: 'folder/:id',
        loadComponent: () =>
          import('./pages/folder/folder.component').then((m) => m.FolderComponent)
      },
      {
        path: 'preview/:id',
        loadComponent: () =>
          import('./pages/preview/preview.component').then((m) => m.PreviewComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then((m) => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
] as Routes;
