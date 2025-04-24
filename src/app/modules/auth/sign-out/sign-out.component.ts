import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
    selector: 'auth-sign-out',
    template: '',
})
export class AuthSignOutComponent implements OnInit {
    constructor(private _authService: OAuthService, private _router: Router) {}

    ngOnInit(): void {
        this._authService.logOut();
    }
}
