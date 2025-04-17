import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';
import { Router } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.check().pipe(
        switchMap((authenticated) => {
            console.log('[AuthGuard] User authenticated?', authenticated);
            if (!authenticated) {
                return of(router.parseUrl('/sign-in?redirectURL=' + state.url));
            }
            return of(true);
        })
    );
};
