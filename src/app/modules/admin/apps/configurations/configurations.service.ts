// src/app/modules/admin/apps/configurations/configurations.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import {
  Page,
  Application,
  ApplicationProperty,
  ApplicationParameter,
} from './configurations.types';

export interface Profile {
  id: number;
  name: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigurationsService {
  private readonly baseUrl     = `${environment.apiUrlConfig}/api/v1/applications`;
  private readonly profilesUrl = `${environment.apiUrlConfig}/api/v1/profiles`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    let headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return headers
      .set('Content-Type', 'application/json')
      .set('Accept', '*/*');
  }

  // — Applications — //

  getApplications(page: number, size: number, sort: string): Observable<Page<Application>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<Page<Application>>(this.baseUrl, {
      params,
      headers: this.getAuthHeaders(),
    });
  }

  getApplication(reference: string): Observable<Application> {
    return this.getApplications(0, 1000, '').pipe(
      map(p => {
        const found = p.content.find(a => a.reference === reference);
        if (!found) throw new Error(`Application ${reference} not found`);
        return found;
      })
    );
  }

  createApplication(payload: {
    reference: string;
    applicationCode: string;
    name: string;
    description: string;
  }): Observable<Application> {
    return this.http.post<Application>(this.baseUrl, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  updateApplication(
    reference: string,
    payload: { reference: string; applicationCode: string; name: string; description: string }
  ): Observable<Application> {
    return this.http.put<Application>(`${this.baseUrl}/${reference}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteApplication(reference: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reference}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // — Profiles — //

  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.profilesUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  createProfile(payload: Profile): Observable<Profile> {
    return this.http.post<Profile>(this.profilesUrl, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  updateProfile(id: number, payload: Profile): Observable<Profile> {
    return this.http.put<Profile>(`${this.profilesUrl}/${id}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.profilesUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // — Business Parameters — //

  getParameters(appRef: string): Observable<ApplicationParameter[]> {
    return this.http.get<ApplicationParameter[]>(`${this.baseUrl}/${appRef}/parameters`, {
      headers: this.getAuthHeaders(),
    });
  }

  addParameter(appRef: string, payload: Partial<ApplicationParameter>): Observable<ApplicationParameter> {
    return this.http.post<ApplicationParameter>(`${this.baseUrl}/${appRef}/parameters`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  updateParameter(
    appRef: string,
    paramRef: string,
    payload: Partial<ApplicationParameter>
  ): Observable<ApplicationParameter> {
    return this.http.put<ApplicationParameter>(
      `${this.baseUrl}/${appRef}/parameters/${paramRef}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteParameter(appRef: string, paramRef: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${appRef}/parameters/${paramRef}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // — Properties — //

  /** List by profile */
  getPropertiesByProfile(appRef: string, profile: string): Observable<ApplicationProperty[]> {
    return this.http.get<ApplicationProperty[]>(`${this.baseUrl}/${appRef}/properties/${profile}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /** Export ZIP */
  exportProperties(appRef: string, profile: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${appRef}/properties/${profile}/export`, {
      responseType: 'blob',
      headers: this.getAuthHeaders(),
    });
  }

  /** Create a new property (POST) */
  addProperty(
    appRef: string,
    payload: {
      profile: string;
      label: string;
      value: string;
      type: string;
    }
  ): Observable<ApplicationProperty> {
    return this.http.post<ApplicationProperty>(
      `${this.baseUrl}/${appRef}/properties`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  /** Update existing property (PUT) */
  updateProperty(
    appRef: string,
    propRef: string,
    payload: {
      profile: string;
      key: string;
      label: string;
      value: string;
      type: string;
    }
  ): Observable<ApplicationProperty> {
    return this.http.put<ApplicationProperty>(
      `${this.baseUrl}/${appRef}/properties/${propRef}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  /** Delete property */
  deleteProperty(appRef: string, propRef: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${appRef}/properties/${propRef}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
