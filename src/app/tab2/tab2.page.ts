import { Component } from '@angular/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(private geolocation: Geolocation) { }

  ngOnInit() {

    this.initMapBox();
  }

  async initMapBox() {
    const myLatLng = await this.getLocation();
    let center = { lon: myLatLng.lng, lat: myLatLng.lat };
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmFydG8zODAiLCJhIjoiY2pzdjlub2NkMDRzdDN5bnp2N3Y0dnVmeCJ9.-9pWtrRt5xe5vVfXu6rQ3A';
    let map = new mapboxgl.Map({
      container: 'map_canvas',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center, //-78.1571629,-0.0508833 // { lon: -78.1523295,lat:0.0388447 } -78.1523295,lat:0.0388447
      zoom: 15
    });


  }//initmapbox

  private async getLocation() {
    // let option: MyLocationOptions = {
    //   enableHighAccuracy: true
    // }
    // const rta = await LocationService.getMyLocation(option);
    const rta = await this.geolocation.getCurrentPosition();
    let latLng = { lat: rta.coords.latitude, lng: rta.coords.longitude };
    return latLng
  }



}
