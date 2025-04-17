import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { firstValueFrom } from 'rxjs';

export const initialDataResolver = async () =>
{
    const messagesService = inject(MessagesService);
    const navigationService = inject(NavigationService);
    const notificationsService = inject(NotificationsService);
    const quickChatService = inject(QuickChatService);
    const shortcutsService = inject(ShortcutsService);

    // Await first emissions of observables (acts like preloading)
    const [messages, notifications, chats, shortcuts] = await Promise.all([
        firstValueFrom(messagesService.messages$),
        firstValueFrom(notificationsService.notifications$),
        firstValueFrom(quickChatService.chats$),
        firstValueFrom(shortcutsService.shortcuts$)
    ]);

    return {
        navigation: navigationService.navigation,
        messages,
        notifications,
        chats,
        shortcuts
    };
};
