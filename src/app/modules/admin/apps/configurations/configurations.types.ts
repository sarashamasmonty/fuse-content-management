// src/app/modules/admin/apps/configurations/configurations.types.ts

export interface Application {
    reference: string;
    applicationCode: string;
    name: string;
    description: string;
    createdDate: string;
    updatedDate: string;
  }
  
// src/app/modules/admin/apps/configurations/configurations.types.ts

export interface ApplicationProperty {
    /** the server-generated identifier */
    reference: string;
    /** the business key */
    key: string;
    /** the human-friendly label */
    label: string;
    /** the string value */
    value: string;
    /** the data type, e.g. "string", "number", etc. */
    type: string;
    /** the profile this property belongs to */
    profile?: string;
  }
  
  
  export interface ApplicationParameter {
    reference: string;
    name: string;
    value: string;
  }
  
  export enum Sort {
    Empty = '',
    Desc  = 'desc',
    Asc   = 'asc'
  }
  
  export interface Pageable {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  }
  
  export interface Page<T> {
    totalElements: number;
    totalPages: number;
    size: number;
    content: T[];
    number: number;           // current page (0-based)
    sort: Sort;               // overall sort direction
    numberOfElements: number; // items on this page
    pageable: Pageable;
    last: boolean;
    first: boolean;
    empty: boolean;
  }
  