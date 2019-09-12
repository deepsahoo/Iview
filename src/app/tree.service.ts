import { Injectable } from '@angular/core';
import { Observable,throwError } from 'rxjs';
import { map,catchError, tap } from 'rxjs/operators';

import { HttpClient, HttpHeaders ,HttpErrorResponse} from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class TreeService {

  constructor(private http: HttpClient) { }

  getNodes(lineId):Observable<any> {
    let url = "http://localhost:8080/fetch"+"/"+lineId;//'assets/'+name+'.json';
     return this.http.get(url).pipe(map((res : Response) => res));

}


getAllServiceLines():Observable<any> {
  let url = "http://localhost:8080/getSL";//'assets/'+name+'.json';
   return this.http.get(url).pipe(map((res : Response) => res));

}


uploadNodeData(event) : Observable<any> {
  let url = 'http://localhost:8080/upload';
  var fileToUpload = event.files[0];
  let input = new FormData();
  input.append("file", fileToUpload);
  input.append("description",fileToUpload.name.substring(0, fileToUpload.name.lastIndexOf(".")))
   return this.http.post(url,input).pipe(
    tap(data => console.log('All: ' + JSON.stringify(data))),
    catchError(this.handleError));
}

updateServiceLine(map,id) : Observable<any> {
  let url = 'http://localhost:8080/update'+"/"+id;
  return this.http.post(url,map).pipe(
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
