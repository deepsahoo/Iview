import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from './../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TreeService {

  url: string = environment.url;
  constructor(private http: HttpClient) { }

  getNodes(lineId): Observable<any> {
    let url = this.url + "fetch/" + lineId;
    return this.http.get(url).pipe(map((res: Response) => res));

  }


  getAllServiceLines(): Observable<any> {
    let url = this.url + "getSL";
    return this.http.get(url).pipe(map((res: Response) => res));

  }


  uploadNodeData(event): Observable<any> {
    let url = this.url + 'upload';
    var fileToUpload = event.files[0];
    let input = new FormData();
    input.append("file", fileToUpload);
    input.append("description", fileToUpload.name.substring(0, fileToUpload.name.lastIndexOf(".")))
    return this.http.post(url, input).pipe(
      tap(data => console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError));
  }

  updateServiceLine(map, id): Observable<any> {
    let url = this.url + 'update/' + id;
    return this.http.post(url, map).pipe(
      tap(data => console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError));
  }

  saveAs(map, id): Observable<any> {
    let url = this.url + 'saveAs/' + id;
    return this.http.post(url, map).pipe(
      tap(data => console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError));
  }

  rename(oldId, newId) {

    var body = 'oldId=' + oldId + '&newId=' + newId;
    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    let options = { headers: headers };
    let url = this.url + 'rename';
    return this.http.post(url, body, options).pipe(
      tap(data => console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError));
  }



  private extractData(res: Response) {
    let body = res.json();
    return body || {};
  }

  private handleError(err: HttpErrorResponse) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
