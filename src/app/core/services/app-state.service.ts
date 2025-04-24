import { Injectable } from '@angular/core';
import { AuthUser } from '../auth/auth.models';
import { LocalStorageService } from './local-storage.service';
import { SessionStorageService } from './session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  constructor(readonly storage: SessionStorageService, private localStorageService : LocalStorageService ) {}

  set session(value: string) {
    this.storage.store('session', value);
  }

  get session(): string {
    return this.storage.retrieve('session');
  }

  setAdditionalParams(key: any, value: any) {
    this.storage.store(key, value);
  }

  getAdditionalParams(key: any): any {
    return this.storage.retrieve(key);
  }

  clearAdditionalParams(key: string) {
    this.storage.clear(key);
  }

  set jwt(value: string) {
    this.storage.store('jwt', value);
  }

  // TODO c# api
  get jwt(): string {
    return this.storage.retrieve('jwt');
  }


  // TODO c# api
  set accessToken(value: string) {
    this.storage.store('accessToken', value);
  }

  // TODO c# api
  get accessToken(): string {
    return this.storage.retrieve('accessToken');
  }

  set refreshToken(value: string) {
    this.storage.store('refreshToken', value);
  }

  get refreshToken(): string {
    return this.storage.retrieve('refreshToken');
  }

  set client(value: AuthUser) {
    this.storage.store('client', JSON.stringify(value));
  }

  get client(): AuthUser {
    return JSON.parse(this.storage.retrieve('client'));
  }


  clearSession() {
    this.storage.clear('accessToken');
    this.storage.clear('session');
    this.storage.clear('refreshToken');
    this.storage.clear('client');
  }

}
