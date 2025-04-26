// src/app/modules/admin/apps/configurations/filter.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Application } from './configurations.types';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: Application[], searchText: string): Application[] {
    if (!items) return [];
    if (!searchText) return items;
    const term = searchText.toLowerCase();
    return items.filter(item =>
      item.reference.toLowerCase().includes(term) ||
      item.applicationCode.toLowerCase().includes(term) ||
      item.name.toLowerCase().includes(term)
    );
  }
}
