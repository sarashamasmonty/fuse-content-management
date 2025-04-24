import { Injectable } from '@angular/core';
import { Navigation } from './navigation.types';
import { FuseNavigationItem } from '@fuse/components/navigation';

const fileManagerItem: FuseNavigationItem = {
  id: 'apps.file-manager',
  title: 'File Manager',
  type: 'basic',
  icon: 'heroicons_outline:cloud',
  link: '/file-manager'
};

export const defaultNavigation: FuseNavigationItem[] = [
  {
    id: 'example',
    title: 'Example',
    type: 'basic',
    icon: 'heroicons_outline:chart-pie',
    link: '/example'
  },
  {
    id: 'apps',
    title: 'Applications',
    subtitle: 'Custom made application designs',
    type: 'group',
    icon: 'heroicons_outline:home',
    children: [fileManagerItem]
  }
];

@Injectable({ providedIn: 'root' })
export class NavigationService {
  public readonly navigation: Navigation = {
    default : defaultNavigation
  }
}