import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { FuseNavigationItem } from '@fuse/components/navigation/navigation.types';
import { FuseVerticalNavigationComponent } from '@fuse/components/navigation/vertical/vertical.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector       : 'fuse-vertical-navigation-spacer-item',
    templateUrl    : './spacer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [NgClass],
})
export class FuseVerticalNavigationSpacerItemComponent implements OnInit, OnDestroy
{
    @Input() item: FuseNavigationItem;
    @Input() name: string;

    private _fuseVerticalNavigationComponent: FuseVerticalNavigationComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

        // Subscribe to onRefreshed on the navigation component
        this._fuseVerticalNavigationComponent.onRefreshed.pipe(
            takeUntil(this._unsubscribeAll),
        ).subscribe(() =>
        {
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
