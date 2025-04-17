import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { AuthSignInComponent } from './modules/auth/sign-in/sign-in.component';
import { AuthSignOutComponent } from './modules/auth/sign-out/sign-out.component';

export const appRoutes: Route[] = [
    { path: 'sign-in', component: AuthSignInComponent },
    { path: 'sign-out', component: AuthSignOutComponent },
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'example' },
    {
        path: '',
        component: LayoutComponent,
        resolve: { initialData: initialDataResolver },
        canActivate: [AuthGuard],
        children: [
            {
                path: 'example',
                loadChildren: () => import('app/modules/admin/example/example.routes').then(m => m.default)
            }
        ]
    }
];
