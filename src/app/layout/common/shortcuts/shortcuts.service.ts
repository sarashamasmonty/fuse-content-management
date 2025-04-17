import { Injectable } from '@angular/core';
import { Shortcut } from 'app/layout/common/shortcuts/shortcuts.types';
import { shortcuts as shortcutsData } from 'app/mock-api/common/shortcuts/data';
import { ReplaySubject, Observable, of } from 'rxjs';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class ShortcutsService {
    private _shortcutsList: Shortcut[] = cloneDeep(shortcutsData);
    private _shortcuts: ReplaySubject<Shortcut[]> = new ReplaySubject<Shortcut[]>(1);

    public readonly shortcuts$: Observable<Shortcut[]> = this._shortcuts.asObservable();

    constructor() {
        this._emit(); // Push initial data
    }

    private _emit(): void {
        this._shortcuts.next(cloneDeep(this._shortcutsList));
    }

    create(shortcut: Shortcut): Observable<Shortcut> {
        const newShortcut: Shortcut = {
            ...shortcut,
            id: crypto.randomUUID()
        };
        this._shortcutsList.unshift(newShortcut);
        this._emit();
        return of(newShortcut);
    }

    update(id: string, shortcut: Shortcut): Observable<Shortcut | null> {
        const index = this._shortcutsList.findIndex(s => s.id === id);
        if (index === -1) return of(null);

        this._shortcutsList[index] = { ...this._shortcutsList[index], ...shortcut };
        this._emit();
        return of(this._shortcutsList[index]);
    }

    delete(id: string): Observable<boolean> {
        const index = this._shortcutsList.findIndex(s => s.id === id);
        if (index === -1) return of(false);

        this._shortcutsList.splice(index, 1);
        this._emit();
        return of(true);
    }
}
