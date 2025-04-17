import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, of } from 'rxjs';
import { messages as mockMessages } from 'app/mock-api/common/messages/data';
import { cloneDeep } from 'lodash-es';
import { Message } from './messages.types';

@Injectable({ providedIn: 'root' })
export class MessagesService {
    private _messages: Message[] = cloneDeep(mockMessages);
    private _messages$: ReplaySubject<Message[]> = new ReplaySubject<Message[]>(1);

    public readonly messages$: Observable<Message[]> = this._messages$.asObservable();

    constructor() {
        this._emit();
    }

    private _emit(): void {
        this._messages$.next(cloneDeep(this._messages));
    }

    create(message: Message): Observable<Message> {
        const newMessage = { ...message, id: crypto.randomUUID() };
        this._messages.unshift(newMessage);
        this._emit();
        return of(newMessage);
    }

    update(id: string, message: Message): Observable<Message> {
        const index = this._messages.findIndex(m => m.id === id);
        if (index !== -1) {
            this._messages[index] = { ...this._messages[index], ...message };
            this._emit();
            return of(this._messages[index]);
        }
        return of(null);
    }

    delete(id: string): Observable<boolean> {
        const index = this._messages.findIndex(m => m.id === id);
        if (index !== -1) {
            this._messages.splice(index, 1);
            this._emit();
            return of(true);
        }
        return of(false);
    }

    markAllAsRead(): Observable<boolean> {
        this._messages = this._messages.map(m => ({ ...m, read: true }));
        this._emit();
        return of(true);
    }
}
