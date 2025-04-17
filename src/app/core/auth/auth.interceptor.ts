import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable, catchError, of, switchMap, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly apiUrl = environment.apiUrl;
  private isRefreshing = false;

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = this.appendCommonHeaders(request);
    request = this.authService.appendTokkenToRequest(request);
    return next.handle(request).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        return this.handle401Error(request, next);
      }
      return throwError(() => error);
    }));
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          request = this.authService.appendTokkenToRequest(request);
          return next.handle(request);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          if (error.status == '403') {
            this.authService.logout()
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(request);
  }

  private appendCommonHeaders(request: HttpRequest<any>) {
    return request;
  }
}
