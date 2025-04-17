import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        FuseAlertComponent,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = { type: 'success', message: '' };
    signInForm: UntypedFormGroup;
    showAlert = false;
    isLoading = false;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
    ) { }

    ngOnInit(): void {
        this.signInForm = this._formBuilder.group({
            username: ['cms-user', [Validators.required]],
            password: ['cms-user', Validators.required],
            rememberMe: [''],
        });
    }

    async signIn(): Promise<void> {
        if (this.signInForm.invalid) {
            this.showError('Please enter both username and password');
            return;
        }

        this.signInForm.disable();
        this.isLoading = true;
        this.showAlert = false;

        try {
            const { username, password } = this.signInForm.value;
            const success = await this._authService.signIn({ username, password });

            if (success) {
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                await this._router.navigateByUrl(redirectURL);
            } else {
                this.showError('Invalid username or password');
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            this.showError('Something went wrong. Please try again.');
        } finally {
            this.signInForm.enable();
            this.isLoading = false;
        }
    }

    private showError(message: string): void {
        this.alert = { type: 'error', message };
        this.showAlert = true;
        this.signInNgForm.resetForm();
    }
}
