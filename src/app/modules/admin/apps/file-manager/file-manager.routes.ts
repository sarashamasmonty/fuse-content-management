import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes
} from '@angular/router';
import { FileManagerComponent } from './file-manager.component';
import { FileManagerListComponent } from './list/list.component';
import { FileManagerDetailsComponent } from './details/details.component';
import { FileManagerService } from './file-manager.service';
import { catchError, throwError } from 'rxjs';

/**
 * Folder resolver
 */
const folderResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const fileManagerService = inject(FileManagerService);
    const router = inject(Router);
    const folderId = route.paramMap.get('folderId') || '/assets';

    return fileManagerService.getItems(folderId).pipe(
        catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            router.navigateByUrl(parentUrl);
            return throwError(() => error);
        })
    );
};

/**
 * Item resolver
 */
const itemResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const fileManagerService = inject(FileManagerService);
    const router = inject(Router);
    const itemId = route.paramMap.get('id');

    return fileManagerService.getItemById(itemId).pipe(
        catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            router.navigateByUrl(parentUrl);
            return throwError(() => error);
        })
    );
};

/**
 * Can deactivate handler
 */
const canDeactivateFileManagerDetails = (
    component: FileManagerDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => {
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    if (!nextState.url.includes('/file-manager')) {
        return true;
    }

    if (nextState.url.includes('/details')) {
        return true;
    }

    return component.closeDrawer().then(() => true);
};

/**
 * Routes for file-manager (should be loaded under 'apps/file-manager')
 */
export default [
    {
        path: '',
        component: FileManagerComponent,
        children: [
            {
                path: 'folders/:folderId',
                component: FileManagerListComponent,
                resolve: {
                    items: folderResolver
                },
                children: [
                    {
                        path: 'details/:id',
                        component: FileManagerDetailsComponent,
                        resolve: {
                            item: itemResolver
                        },
                        canDeactivate: [canDeactivateFileManagerDetails]
                    }
                ]
            },
            {
                path: '',
                component: FileManagerListComponent,
                resolve: {
                    items: () => inject(FileManagerService).getItems('/assets')
                },
                children: [
                    {
                        path: 'details/:id',
                        component: FileManagerDetailsComponent,
                        resolve: {
                            item: itemResolver
                        },
                        canDeactivate: [canDeactivateFileManagerDetails]
                    }
                ]
            }
        ]
    }
] as Routes;
