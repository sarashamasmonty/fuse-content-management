import { Injectable } from '@angular/core';
import { Chat } from 'app/layout/common/quick-chat/quick-chat.types';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { chats as mockChats } from 'app/mock-api/apps/chat/data'; // <- make sure this exists
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class QuickChatService {
    private _chat: BehaviorSubject<Chat | null> = new BehaviorSubject<Chat | null>(null);
    private _chats: BehaviorSubject<Chat[] | null> = new BehaviorSubject<Chat[] | null>(null);

    public readonly chat$: Observable<Chat | null> = this._chat.asObservable();
    public readonly chats$: Observable<Chat[] | null> = this._chats.asObservable();

    constructor() {
        this._loadChats(); // Load data locally
    }

    /**
     * Load all chats from local mock data
     */
    private _loadChats(): void {
        const clonedChats = cloneDeep(mockChats);
        this._chats.next(clonedChats);
    }

    /**
     * Get chat by ID from memory
     */
    getChatById(id: string): Observable<Chat> {
        const chat = this._chats.value?.find(c => c.id === id);
        if (!chat) {
            return throwError(() => new Error('Could not find chat with id of ' + id));
        }
        this._chat.next(chat);
        return of(chat);
    }
}
