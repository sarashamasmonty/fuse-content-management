import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { firstValueFrom } from 'rxjs';

export const initialDataResolver = async () =>
{
    const navigationService = inject(NavigationService);
    const [] = await Promise.all([

    ]);

    return {
        navigation: navigationService.navigation,
    };
};
