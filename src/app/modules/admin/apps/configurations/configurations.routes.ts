import { Routes } from '@angular/router';

export default [
  {
    // List view
    path: '',
    loadComponent: () =>
      import('./configurations.component').then(m => m.ConfigurationsComponent),
  },
  {
    // /configurations/new → New screen
    path: 'new',
    loadComponent: () =>
      import('./configurations-edit/configurations-edit.component').then(m => m.ConfigurationsEditComponent),
  },
  {
    // /configurations/:appRef/edit → Edit screen
    path: ':appRef/edit',
    loadComponent: () =>
      import('./configurations-edit/configurations-edit.component').then(m => m.ConfigurationsEditComponent),
  },
  {
    // /configurations/:appRef/parameters
    path: ':appRef/parameters',
    loadComponent: () =>
      import('./app-parameters/app-parameters.component').then(m => m.AppParametersComponent),
  },
  {
    // /configurations/:appRef/properties
    path: ':appRef/properties',
    loadComponent: () =>
      import('./app-properties/app-properties.component').then(m => m.AppPropertiesComponent),
  },
] as Routes;
