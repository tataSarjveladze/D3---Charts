import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, retry } from 'rxjs';

import * as d3 from 'd3';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private httpClient: HttpClient) {}

  getParsedData(url: string): Observable<any> {
    return this.httpClient.get(url, { responseType: 'text' }).pipe(
      retry(3),
      map((csv) => d3.csvParse(csv))
    );
  }

  getParsedJson(url: string): Observable<any> {
    return this.httpClient.get(url).pipe(retry(3));
  }
}
