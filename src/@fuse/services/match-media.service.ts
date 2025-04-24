import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MediaChange, MediaObserver } from '@angular/flex-layout';

@Injectable({
    providedIn: 'root'
})
export class FuseMatchMediaService
{
    activeMediaQuery: string;
    onMediaChange: BehaviorSubject<string> = new BehaviorSubject<string>('');
    mediaSub: Subscription;

    /**
     * Constructor
     *
     * @param {MediaObserver} _mediaObserver
     */
    constructor(
        private _mediaObserver: MediaObserver
    )
    {
        // Set the defaults
        this.activeMediaQuery = '';

        // Initialize
        this._init();

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Initialize
     *
     * @private
     */
    private _init(): void
    {
        this.mediaSub = this._mediaObserver.asObservable().subscribe((changes: MediaChange[]) => {
            if (changes.length > 0) {
                this.activeMediaQuery = changes[0].mqAlias;
                console.log('📱 Current breakpoint:', this.activeMediaQuery);
            }
        });
    }

    ngOnDestroy(): void {
        this.mediaSub.unsubscribe();
    }

}