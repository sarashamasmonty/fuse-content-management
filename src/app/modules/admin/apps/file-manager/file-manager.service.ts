import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { Items, Item } from './file-manager.types';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class FileManagerService {
    private readonly apiUrl = environment.apiUrl;

    private _items: BehaviorSubject<Items> = new BehaviorSubject<Items>({
        folders: [],
        files: [],
        path: []
    });

    private _item: BehaviorSubject<Item | null> = new BehaviorSubject<Item | null>(null);

    public readonly items$: Observable<Items> = this._items.asObservable();
    public readonly item$: Observable<Item | null> = this._item.asObservable();

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        return token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();
    }

    getFolders(): void {
        this.http.get<any[]>(`${this.apiUrl}/v1/cms/folders?folderPath=/assets`, {
            headers: this.getAuthHeaders()
        }).subscribe({
            next: (response: any[]) => {
                console.log('✅ Raw folder response:', response);

                const items: Items = {
                    folders: response,
                    files: [],
                    path: []
                };

                this._items.next(items);
            },
            error: (err) => {
                console.error('❌ Failed to fetch folders:', err);
            }
        });
    }


    addFolder(folder: { name: string, parentPath: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/v1/cms/folders`, folder, {
            headers: this.getAuthHeaders(),
            responseType: 'text'
        });
    }

    getItems(folderPath: string): Observable<any> {
        return this.http.get<any[]>(`${this.apiUrl}/v1/cms/folders?folderPath=${folderPath}`, {
            headers: this.getAuthHeaders()
        });
    }

    getItemById(id: string): Observable<Item> {
        return this._items.pipe(
            take(1),
            map((items) => {
                // Find within the folders and files
                const item = [...items.folders, ...items.files].find(value => value.id === id) || null;

                // Update the item
                this._item.next(item);

                // Return the item
                return item;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('Could not found the item with id of ' + id + '!');
                }

                return of(item);
            }),
        );
    }


    uploadFile(document: any) {
        var formData: FormData = new FormData();
        formData.append("parentPath", document.parentPath);
        formData.append("name", document.name);
        formData.append("content", document.content);

        if (document.id) {
            formData.append("id", document.id);
        }

        return this.http.post(`${this.apiUrl}/v1/cms/documents`, formData, {
            responseType: 'text',
            headers: this.getAuthHeaders(),
        });
    }

    // getDocuments(path: string = "/"): void {
    //     const params = new HttpParams().set("path", path);

    //     this.http.get<any[]>(`${this.apiUrl}/v1/cms/documents`, {
    //         params,
    //         headers: this.getAuthHeaders()
    //     }).subscribe({
    //         next: (response: any[]) => {
    //             console.log('✅ Documents response:', response);

    //             // Get the current value
    //             const currentItems = this._items.value;

    //             // Update files list, preserve folders and path
    //             this._items.next({
    //                 ...currentItems,
    //                 files: response
    //             });
    //         },
    //         error: (err) => {
    //             console.error('❌ Failed to fetch documents:', err);
    //         }
    //     });
    // }


    getDocumentVersions(docId: string) {
        return this.http.get<any[]>(`${this.apiUrl}/cms/documents/${docId}/versions`);
    }

    setItem(item: Item): void {
        this._item.next(item);
    }

    // getFolders(folderPath: string = '/'): void {
    //     this.http.get<Items>(`${this.apiUrl}/v1/cms/folders?folderPath=${folderPath}`, {
    //         headers: this.getAuthHeaders()
    //     }).subscribe((data: Items) => {
    //         this._items.next(data);
    //     });
    // }

    getDocuments(folderPath: string = '/'): void {
        this.http.get<Item[]>(`${this.apiUrl}/v1/cms/documents?folderPath=${folderPath}`, {
            headers: this.getAuthHeaders()
        }).subscribe((docs: Item[]) => {
            const current = this._items.value;
            this._items.next({ ...current, files: docs });
        });
    }

}
