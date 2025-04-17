import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-out',
    template: '',
})
export class AuthSignOutComponent implements OnInit {
    constructor(private _authService: AuthService, private _router: Router) {}

    ngOnInit(): void {
        this._authService.signOut().subscribe(() => {
            this._router.navigate(['/sign-in']);
        });
    }
}
