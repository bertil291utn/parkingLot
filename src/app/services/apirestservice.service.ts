import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HTTP } from '@ionic-native/http/ngx';

@Injectable({
  providedIn: 'root'
})
export class ApirestserviceService {

  mainBasePath = 'https://wsparking.herokuapp.com/parking/';
  constructor(private httpnative: HTTP
    , private http: HttpClient
  ) { }


  public nearbySearch(lon: number, lat: number, tipo: number) {
    let url = `nearby_parking?lon=${lon}&lat=${lat}&tipo=${tipo}`;
    return this.makeRequestGet(url);
  }


  private makeRequestGet(url: string) {
    return this.httpnative.get(this.mainBasePath + url, {}, {});
  }

  public distance_array(myLatLng, tipoAutomovil) {
    let url = `distance_array?lat_init=${myLatLng.lat}&lon_init=${myLatLng.lng}&tipo_parking=${tipoAutomovil}`;
    return this.http.get(this.mainBasePath + url);
  }

  public post_comment(data) {
    let url = `https://y7tyidkjym1dbea-fincabf.adb.us-ashburn-1.oraclecloudapps.com/ords/bf_finca/bodega/comments?comment=${data.comentario}&updates=${data.updates}&email=${data.email}&whatsapp=${data.whatsapp}&tipo_auto=${data.tipo_auto}`;
    return this.http.post(url, null, { responseType: 'json' });
  }

}//end service
