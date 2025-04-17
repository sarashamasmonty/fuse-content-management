import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated = false;

    private readonly dummyAccessToken = 'mock_access_token';
    private readonly dummyRefreshToken = 'mock_refresh_token';
    private readonly tokenTTL = 3600;

    private readonly mockUsers: Record<string, User> = {
        'cms-user': {
            id: '1',
            name: 'CMS User',
            email: 'cms-user@example.com',
            avatar: '../../../assets/images/avatars/brian-hughes.jpg',
            status: 'online'
        }
    };

    constructor(private _userService: UserService) { }

    set accessToken(token: string) {
        localStorage.setItem('access_token', token);
    }

    get accessToken(): string {
        return localStorage.getItem('access_token') ?? '';
    }

    async signIn(credentials: { username: string; password: string }): Promise<boolean> {
        const { username, password } = credentials;

        if (this.mockUsers[username] && password === username) {
            const now = Date.now();

            localStorage.setItem('access_token', this.dummyAccessToken);
            localStorage.setItem('refresh_token', this.dummyRefreshToken);
            localStorage.setItem('token_type', 'Bearer');
            localStorage.setItem('expires_in', this.tokenTTL.toString());
            localStorage.setItem('token_obtained_at', now.toString());

            this._authenticated = true;
            this._userService.user = this.mockUsers[username];

            return true;
        }

        return false;
    }

    signInUsingToken(): Observable<boolean> {
        if (!this.accessToken || this.isAccessTokenExpired()) {
            return of(false);
        }

        this._authenticated = true;
        this._userService.user = this.mockUsers['cms-user'];

        return of(true);
    }

    signOut(): Observable<boolean> {
        localStorage.clear();
        this._authenticated = false;
        return of(true);
    }

    isAccessTokenExpired(): boolean {
        const obtainedAt = parseInt(localStorage.getItem('token_obtained_at') ?? '0', 10);
        const expiresIn = parseInt(localStorage.getItem('expires_in') ?? '0', 10);
        return !obtainedAt || !expiresIn || Date.now() > (obtainedAt + expiresIn * 1000);
    }

    check(): Observable<boolean> {
        if (this._authenticated) return of(true);
        if (!this.accessToken) return of(false);
        if (this.isAccessTokenExpired()) return of(false);
        return this.signInUsingToken();
    }

    refreshToken(): Observable<boolean> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken || refreshToken !== this.dummyRefreshToken) return of(false);

        const now = Date.now();
        localStorage.setItem('access_token', this.dummyAccessToken);
        localStorage.setItem('token_obtained_at', now.toString());

        return of(true);
    }

}
