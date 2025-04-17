import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthInterface } from './auth.interface';
export class SessionService {
    get session(){
        let userContext = sessionStorage.getItem("cms_userContext")
        return  userContext ? JSON.parse(userContext) : null ;
    }

    set session(value:AuthInterface){
        sessionStorage.setItem("cms_userContext",JSON.stringify(value) )
    }

    clearSession(){
        sessionStorage.removeItem("cms_userContext");
    }
}