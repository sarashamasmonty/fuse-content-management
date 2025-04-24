import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

import { OAuthSelfService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate, CanActivateChild {
  constructor(private router: Router, private oauthService: OAuthSelfService) { }

  private checkAccess(targetUrl: string): Observable<boolean> {
    return this.oauthService.isAuthenticated$.pipe(
      take(1), // take the current value only
      tap(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/sign-in'], { queryParams: { redirectTo: targetUrl } });
        }
      }),
      map(isAuthenticated => isAuthenticated)
    );
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAccess(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAccess(state.url);
  }
}
