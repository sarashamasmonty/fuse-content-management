import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { OAuthSelfService } from '../auth.service';
import { AppStateService } from 'app/core/services/app-state.service';
import { environment } from 'environments/environment';
import { SessionService } from '../session.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private refreshingToken: boolean = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private readonly authService: OAuthSelfService,
    private oauthService: OAuthService,
    private readonly router: Router,
    private readonly state: AppStateService,
    private session: SessionService
  ) {}

  private clearSession(): void {
    this.authService.logout();
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          const isApiUrl = request.url.indexOf(environment.oauthApi) > -1 || request.url.indexOf(environment.apiUrl) > -1;
          if (isApiUrl) {
            if (this.refreshingToken) {
              return this.refreshTokenSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap(() => next.handle(this.addTokenToRequest(request)))
              );
            } else {
              this.refreshingToken = true;
              this.refreshTokenSubject.next(null);

              return from(this.oauthService.refreshToken()).pipe(
                switchMap((token: any) => {
                  this.refreshingToken = false;
                  this.refreshTokenSubject.next(token);
                  return next.handle(this.addTokenToRequest(request));
                }),
                catchError((refreshError: any) => {
                  this.refreshingToken = false;
                  this.clearSession();
                  this.router.navigateByUrl('/login');
                  return throwError(refreshError);
                })
              );
            }
          }
          if (error.statusText === 'Unauthorized' || +error.error?.errcode === 50000) {
            this.router.navigateByUrl('/login');
            this.clearSession();
          }
          return throwError(error);
        } else {
          return throwError(error);
        }
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.state.accessToken;
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
