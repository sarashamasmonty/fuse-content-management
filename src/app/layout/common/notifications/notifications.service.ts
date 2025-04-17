import { Injectable } from '@angular/core';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { notifications as notificationsData } from 'app/mock-api/common/notifications/data';
import { Observable, ReplaySubject, of } from 'rxjs';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
    private _notifications: Notification[] = cloneDeep(notificationsData);
    private _notificationsSubject: ReplaySubject<Notification[]> = new ReplaySubject<Notification[]>(1);

    public readonly notifications$: Observable<Notification[]> = this._notificationsSubject.asObservable();

    constructor() {
        this._emit();
    }

    private _emit(): void {
        this._notificationsSubject.next(cloneDeep(this._notifications));
    }

    getAll(): Notification[] {
        return [...this._notifications];
    }

    create(notification: Notification): Observable<Notification> {
        const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            read: false,
            time: new Date().toISOString()
        };
        this._notifications.unshift(newNotification);
        this._emit();
        return of(newNotification);
    }

    update(id: string, updated: Partial<Notification>): Observable<Notification | null> {
        const index = this._notifications.findIndex(n => n.id === id);
        if (index === -1) return of(null);

        this._notifications[index] = { ...this._notifications[index], ...updated };
        this._emit();
        return of(this._notifications[index]);
    }

    delete(id: string): Observable<boolean> {
        const index = this._notifications.findIndex(n => n.id === id);
        if (index === -1) return of(false);

        this._notifications.splice(index, 1);
        this._emit();
        return of(true);
    }

    markAllAsRead(): Observable<boolean> {
        this._notifications = this._notifications.map(n => ({ ...n, read: true }));
        this._emit();
        return of(true);
    }

    toggleReadStatus(id: string, read: boolean): Observable<Notification | null> {
        const index = this._notifications.findIndex(n => n.id === id);
        if (index === -1) return of(null);

        this._notifications[index].read = read;
        this._emit();
        return of(this._notifications[index]);
    }
}
