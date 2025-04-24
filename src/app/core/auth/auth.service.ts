import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { AuthInterface } from './auth.interface';
import { SessionService } from './session.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class OAuthSelfService {
    private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
    public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject$.asObservable();
    private userTokeContext?: AuthInterface;
    private sessionService: SessionService;

    private readonly tokenTTL = 3600;

    private readonly mockUsers: Record<string, User> = {
        'cms-user': {
            id: '1',
            name: 'CMS User',
            email: 'cms-user@example.com',
            avatar: '../../../assets/images/avatars/brian-hughes.jpg',
            status: 'online',
        },
    };

    constructor(
        private _userService: UserService,
        private readonly router: Router,
        private readonly http: HttpClient
    ) {
        this.sessionService = new SessionService();
        this.userTokeContext = this.sessionService.session;
    }

    set accessToken(token: string) {
        localStorage.setItem('access_token', token);
    }

    get accessToken(): string {
        return localStorage.getItem('access_token') ?? '';
    }

    public async runInitialLoginSequence(): Promise<void> {
        const token = localStorage.getItem('access_token');
        const isValid = token && !this.isAccessTokenExpired();

        if (isValid) {
            this.isAuthenticatedSubject$.next(true);
            const mockUser = this.mockUsers['cms-user'];
            this._userService.user = mockUser;
        } else {
            this.logout();
            await this.router.navigate(['/sign-in']);
        }
    }


    async signIn(credentials: { username: string; password: string }): Promise<boolean> {
        const body = new HttpParams()
            .set('grant_type', environment.grant_type)
            .set('client_secret', environment.client_secret)
            .set('client_id', environment.client_id)
            .set('username', credentials.username)
            .set('password', credentials.password);

        try {
            const response: any = await this.http
                .post(environment.oauthApi, body.toString(), {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }),
                })
                .toPromise();

            const now = Date.now();
            const { access_token, refresh_token, expires_in } = response;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('token_type', 'Bearer');
            localStorage.setItem('expires_in', expires_in.toString());
            localStorage.setItem('token_obtained_at', now.toString());

            this.isAuthenticatedSubject$.next(true);

            this._userService.user = {
                id: 'cms-user',
                name: credentials.username,
                email: `${credentials.username}@example.com`,
                avatar: '../../../assets/images/avatars/brian-hughes.jpg',
                status: 'online',
            };

            return true;
        } catch (error) {
            console.error('OAuth sign-in failed:', error);
            return false;
        }
    }

    signInUsingToken(): Observable<boolean> {
        if (!this.accessToken || this.isAccessTokenExpired()) {
            return of(false);
        }

        this.isAuthenticatedSubject$.next(true);
        this._userService.user = this.mockUsers['cms-user'];

        return of(true);
    }

    signOut(): Observable<boolean> {
        localStorage.clear();
        this.isAuthenticatedSubject$.next(false);
        return of(true);
    }

    isAccessTokenExpired(): boolean {
        const obtainedAt = parseInt(localStorage.getItem('token_obtained_at') ?? '0', 10);
        const expiresIn = parseInt(localStorage.getItem('expires_in') ?? '0', 10);
        return !obtainedAt || !expiresIn || Date.now() > obtainedAt + expiresIn * 1000;
    }

    check(): Observable<boolean> {
        if (this.isAuthenticated) return of(true);
        if (!this.accessToken) return of(false);
        if (this.isAccessTokenExpired()) return of(false);
        return this.signInUsingToken();
    }

    refreshToken(): Observable<boolean> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return of(false);

        const now = Date.now();
        const newAccessToken = `access_token_${now}`; // You should actually call refresh endpoint

        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('token_obtained_at', now.toString());

        return of(true);
    }

    isAuthenticated(): boolean {
        return (
            this.userTokeContext?.accessToken &&
            this.userTokeContext?.expirationTime > Date.now()
        );
    }

    appendTokkenToRequest(request: HttpRequest<any>): HttpRequest<any> {
        const token = this.accessToken;

        if (token && !this.isAccessTokenExpired()) {
            return request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        return request;
    }

    logout() {
        this.sessionService.clearSession();
        this.router.navigate(['/login']);
    }
}
