import { Injectable } from '@angular/core';
import { FuseSidebarComponent } from './sidebar.component';

@Injectable({
    providedIn: 'root'
})
export class FuseSidebarService {
    // Private registry
    private _registry: Record<string, FuseSidebarComponent> = {};

    /**
     * Register a sidebar
     */
    register(key: string, sidebar: FuseSidebarComponent): void {
        if (!key || !sidebar) {
            console.warn(`[FuseSidebarService] Invalid key or sidebar for registration.`);
            return;
        }

        if (this._registry[key]) {
            console.error(`[FuseSidebarService] A sidebar is already registered under the key '${key}'.`);
            return;
        }

        this._registry[key] = sidebar;
    }

    /**
     * Unregister a sidebar
     */
    unregister(key: string): void {
        if (!this._registry[key]) {
            console.warn(`[FuseSidebarService] No sidebar registered under the key '${key}'.`);
            return;
        }

        delete this._registry[key];
    }

    /**
     * Get a sidebar
     */
    getSidebar(key: string): FuseSidebarComponent | undefined {
        return this._registry[key];
    }
}
