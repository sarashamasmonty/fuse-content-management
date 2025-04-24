import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';
import { ApiInterceptor } from './inteceptors/auth.interceptor';
import { OAuthService } from 'angular-oauth2-oidc';

export const provideAuth = (): Array<Provider | EnvironmentProviders> => {
    return [
        provideHttpClient(),
        {
            provide : ENVIRONMENT_INITIALIZER,
            useValue: () => inject(OAuthService),
            multi   : true,
        },
        { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
    ];
};