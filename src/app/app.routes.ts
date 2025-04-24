import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthSignInComponent } from './modules/auth/sign-in/sign-in.component';
import { AuthSignOutComponent } from './modules/auth/sign-out/sign-out.component';
import { AuthGuardService } from './core/auth/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

export const appRoutes: Route[] = [
    { path: 'sign-in', component: AuthSignInComponent },
    { path: 'sign-out', component: AuthSignOutComponent },
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'example' },

    {
        path: '',
        component: LayoutComponent,
        resolve: { initialData: initialDataResolver },
        canActivate: [AuthGuardService],
        children: [
            {
                path: 'example',
                loadChildren: () =>
                    import('app/modules/admin/example/example.routes').then(m => m.default)
            },
            {
                path: 'file-manager',
                loadChildren: () =>
                    import('app/modules/admin/apps/file-manager/file-manager.routes').then(m => m.default)
            }
        ]
    },
];
