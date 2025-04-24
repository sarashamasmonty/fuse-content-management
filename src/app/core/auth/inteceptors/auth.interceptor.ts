import { HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppStateService } from 'app/core/services/app-state.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';


@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private readonly apiUrl = environment.oauthApi;

  constructor(private readonly state: AppStateService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.includes(environment.oauthApi) || request.url.split('/')[1] === 'assets') {
      return next.handle(request);
    }

    if (this.state.session) {
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.state.accessToken}`,
          'x-sid': this.state.session,
          'Cache-Control': 'no-store, no-cache, max-age=0'
        },
      });
    } else {
      request = request.clone({
        setHeaders: {
          'Cache-Control': 'no-store, no-cache, max-age=0'
        },
      });
    }

    return next.handle(request.clone({ url: request.url }));
  }
}
