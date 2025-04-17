/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

const fileManagerItem: FuseNavigationItem = {
    id   : 'apps.file-manager',
    title: 'File Manager',
    type : 'basic',
    icon : 'heroicons_outline:cloud',
    link : '/file-manager' // ✅ Fixed path
};

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id      : 'apps',
        title   : 'Applications',
        subtitle: 'Custom made application designs',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [ fileManagerItem ]
    }
];

export const compactNavigation: FuseNavigationItem[] = [...defaultNavigation];
export const futuristicNavigation: FuseNavigationItem[] = [...defaultNavigation];
export const horizontalNavigation: FuseNavigationItem[] = [...defaultNavigation];
