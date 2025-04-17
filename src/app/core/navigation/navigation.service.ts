import { Injectable } from '@angular/core';
import {
  compactNavigation,
  defaultNavigation,
  futuristicNavigation,
  horizontalNavigation,
} from 'app/mock-api/common/navigation/data';
import { Navigation } from './navigation.types';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  public readonly navigation: Navigation = {
    compact: compactNavigation,
    default: defaultNavigation,
    futuristic: futuristicNavigation,
    horizontal: horizontalNavigation,
  };
}
