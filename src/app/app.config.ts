import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PreloadAllModules, provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { provideFuse } from '@fuse';
import { provideTransloco, TranslocoService } from '@ngneat/transloco';
import { firstValueFrom } from 'rxjs';
import { appRoutes } from 'app/app.routes';
import { provideIcons } from 'app/core/icons/icons.provider';
import { TranslocoHttpLoader } from './core/transloco/transloco.http-loader';
import { provideAuth } from './core/auth/auth.provider';
import { OAuthSelfService } from './core/auth/auth.service';
import { AuthGuardService } from './core/auth/guards/auth.guard';
import { SessionService } from './core/auth/session.service';
import { LocalStorageService } from './core/services/local-storage.service';
import { SessionStorageService } from './core/services/session-storage.service';
import { DateTimeProvider, OAuthLogger, OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { FUSE_CONFIG } from '@fuse/services/config/config.constants';

export const appConfig: ApplicationConfig = {
    providers: [
        AuthGuardService,
        OAuthService,
        OAuthSelfService,
        UrlHelperService,
        SessionService,
        LocalStorageService,
        SessionStorageService,
        {
            provide: OAuthLogger,
            useValue: {
                debug: (...args: any[]) => { },
                info: (...args: any[]) => { },
                warn: (...args: any[]) => { },
                error: (...args: any[]) => { },
            }
        },
        {
            provide: DateTimeProvider,
            useValue: {
                now: () => new Date()
            }
        },
        provideAnimations(),
        provideHttpClient(),
        provideRouter(appRoutes,
            withPreloading(PreloadAllModules),
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
        ),
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
        },
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: 'D',
                },
                display: {
                    dateInput: 'DDD',
                    monthYearLabel: 'LLL yyyy',
                    dateA11yLabel: 'DD',
                    monthYearA11yLabel: 'LLLL yyyy',
                },
            },
        },
        provideTransloco({
            config: {
                availableLangs: [
                    {
                        id: 'en',
                        label: 'English',
                    },
                    {
                        id: 'tr',
                        label: 'Turkish',
                    },
                ],
                defaultLang: 'en',
                fallbackLang: 'en',
                reRenderOnLangChange: true,
                prodMode: true,
            },
            loader: TranslocoHttpLoader,
        }),
        {
            provide: APP_INITIALIZER,
            useFactory: () => {
                const translocoService = inject(TranslocoService);
                const defaultLang = translocoService.getDefaultLang();
                translocoService.setActiveLang(defaultLang);

                return () => firstValueFrom(translocoService.load(defaultLang));
            },
            multi: true,
        },
        provideAuth(),
        provideIcons(),
        {
            provide: FUSE_CONFIG,
            useValue: {
                layout: 'classy',
                scheme: 'light',
                theme: 'theme-default',
                screens: {
                    sm: '600px',
                    md: '960px',
                    lg: '1280px',
                    xl: '1440px'
                }
            }
        },
        provideFuse({
            fuse: {
                layout: 'classy',
                scheme: 'light',
                screens: {
                    sm: '600px',
                    md: '960px',
                    lg: '1280px',
                    xl: '1440px',
                },
                theme: 'theme-default',
                themes: [
                    {
                        id: 'theme-default',
                        name: 'Default',
                    },
                    {
                        id: 'theme-brand',
                        name: 'Brand',
                    },
                    {
                        id: 'theme-teal',
                        name: 'Teal',
                    },
                    {
                        id: 'theme-rose',
                        name: 'Rose',
                    },
                    {
                        id: 'theme-purple',
                        name: 'Purple',
                    },
                    {
                        id: 'theme-amber',
                        name: 'Amber',
                    },
                ],
            },
        }),
    ],
};
