import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  // Store data in sessionStorage
  store(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  // Retrieve data from sessionStorage
  retrieve(key: string): any {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  // Clear specific data from sessionStorage
  clear(key: string): void {
    sessionStorage.removeItem(key);
  }

  // Clear all data from sessionStorage
  clearAll(): void {
    sessionStorage.clear();
  }
}
