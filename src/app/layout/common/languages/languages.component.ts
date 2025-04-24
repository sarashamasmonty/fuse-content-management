import { NgIf, NgFor, NgTemplateOutlet } from '@angular/common'; // Ensure correct imports
import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';
import { take } from 'rxjs';

@Component({
    selector: 'languages',
    templateUrl: './languages.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'languages',
    standalone: true,
    imports: [
        MatButtonModule, 
        MatMenuModule, 
        NgTemplateOutlet, 
        NgFor, 
        NgIf
    ],
})
export class LanguagesComponent implements OnInit, OnDestroy {
    availableLangs: AvailableLangs;
    activeLang: string;
    flagCodes: any;

    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _translocoService: TranslocoService,
    ) {}

    ngOnInit(): void {
        this.availableLangs = this._translocoService.getAvailableLangs();

        this._translocoService.langChanges$.subscribe((activeLang) => {
            this.activeLang = activeLang;
            this._updateNavigation(activeLang);
        });

        this.flagCodes = {
            'en': 'us',
            'tr': 'tr',
        };
    }

    ngOnDestroy(): void {}

    setActiveLang(lang: string): void {
        this._translocoService.setActiveLang(lang);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    private _updateNavigation(lang: string): void {
        const navComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');
        if (!navComponent) {
            return;
        }
        const navigation = navComponent.navigation;
        const projectDashboardItem = this._fuseNavigationService.getItem('dashboards.project', navigation);
        if (projectDashboardItem) {
            this._translocoService.selectTranslate('Project').pipe(take(1))
                .subscribe((translation) => {
                    projectDashboardItem.title = translation;
                    navComponent.refresh();
                });
        }
    }
}
