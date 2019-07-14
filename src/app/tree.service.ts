import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class TreeService {

  constructor(private http: HttpClient) { }

  getNodes(name):Observable<any> {
    let url = 'assets/'+name+'.json';
     return this.http.get(url).pipe(map((res : Response) => res));

}


private extractData(res: Response) {
    let body = res.json();
    return body || {};
}
}
