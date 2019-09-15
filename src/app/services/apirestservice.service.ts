import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApirestserviceService {

  mainBasePath = 'https://wsparking.herokuapp.com/';
  constructor(private http: HttpClient) { }


  public nearbySearch(lon: number, lat: number, tipo: number): Observable<any> {
    let url = `nearby_parking?lon=${lon}&lat=${lat}&tipo=${tipo}`;
    return this.makeRequestGet(url);
  }


  private makeRequestGet(url: string, header?: HttpHeaders) {
    if (header != null || undefined)
      return this.http.get(this.mainBasePath + url, { headers: header, responseType: 'json' });
    else
      return this.http.get(this.mainBasePath + url, { responseType: 'json' });
  }

}//end service
