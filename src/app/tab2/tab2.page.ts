import { Component } from '@angular/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.js';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoadingController } from '@ionic/angular';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  accessToken: string = 'pk.eyJ1IjoiYmFydG8zODAiLCJhIjoiY2pzdjlub2NkMDRzdDN5bnp2N3Y0dnVmeCJ9.-9pWtrRt5xe5vVfXu6rQ3A';
  loadingMap;
  pinEnable: boolean = false;
  propiedadesObject;

  constructor(private geolocation: Geolocation, public loadingController: LoadingController, private titlecasePipe: TitleCasePipe
  ) { }

  ngOnInit() {

    this.initMapBox();
  }

  async initMapBox() {
    this.loadingMap = await this.loadingController.create({
      message: 'Map loading...'
    });

    await this.loadingMap.present();
    const myLatLng = await this.getLocation();
    let center = { lon: myLatLng.lng, lat: myLatLng.lat };

    mapboxgl.accessToken = this.accessToken;
    let map = new mapboxgl.Map({
      container: 'map_canvas',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center, //-78.1571629,-0.0508833 // { lon: -78.1523295,lat:0.0388447 } -78.1523295,lat:0.0388447
      zoom: 15
    });

    // let marker = new mapboxgl.Marker()
    // .setLngLat(center)
    // .addTo(map);

    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));//anadir boton de ubicacion punto azul

    // var directions = new MapboxDirections({
    //   accessToken: this.accessToken,
    //   unit: 'metric',
    //   profile: 'mapbox/driving-traffic',
    //   congestion: true,
    //   controls: { inputs: false },
    //   language: 'es'
    // });
    // directions.setOrigin([center.lon, center.lat]);

    // map.addControl(directions, 'top-left');



    map.on('load', () => {
      this.asignarObjetoGeoJson();
      this.anadirLayerParking(map);
      this.loadingMap.dismiss();
    });//


    this.viewFooter(map);//mostrar footer con valores

  }//initmapbox



  private viewFooter(map) {

    let markerParking = new mapboxgl.Marker();
    map.on('click', () => {
      if (this.pinEnable) {
        markerParking.remove();
        this.pinEnable = false;
      }
    });//verificar si hace click en el map y si ha dado click a cualquier de los estacionamientos, se  va a quitar el foot y el marker


    map.on('click', 'parking', (e) => {
      // var title = '<h3><strong>No. </strong>' + e.features[0].properties.id + '</h3>';
      // var storeAddress = '<p><strong>Tipo. </strong>' + this.titlecaseTransform(e.features[0].properties.tipo) + '</p>';
      var coordinates = e.features[0].geometry.coordinates.slice();
      // var content = title + storeAddress;

      // popup.setLngLat(coordinates)
      //   .setHTML(content)
      //   .addTo(map);
      this.propiedadesObject = e.features[0].properties;
      // console.log('e.features[0].propiedades: ', e.features[0].propiedades);
      markerParking.setLngLat(coordinates)
        .addTo(map);
      this.pinEnable = true;
    });
  }

  private anadirLayerParking(map) {
    map.addSource('tilequery', { //crear una fuente de tipo geojson ,de nombre tilequery
      type: "geojson",
      data: this.geojson
    });

    map.addLayer({ //anadir el layer con el dataset tilequery
      id: "parking",
      type: "circle",
      source: "tilequery", // Set the layer source
      paint: {//anadir esilo al layer 
        "circle-stroke-color": "white",
        "circle-stroke-width": {
          stops: [
            [0, 0.1],
            [18, 3]
          ],
          base: 5
        },
        "circle-radius": {
          stops: [
            [12, 5],
            [22, 180]
          ],
          base: 5
        },
        "circle-color": [ // Specify the color each circle should be
          'match', // Use the 'match' expression: https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
          ['get', 'tipo'], // Use the result 'tipo' property
          'automovil', '#FF8C00',
          'motocicleta', '#9ACD32',
          'especial', '#008000',
          '#FF0000']/*  default value */
      }
    });
  }

  private async getLocation() {
    const rta = await this.geolocation.getCurrentPosition();
    let latLng = { lat: rta.coords.latitude, lng: rta.coords.longitude };
    return latLng
  }

  private parkingLot() {
    return [
      { id: 123, ubicacion: { lon: -78.143721, lat: 0.040875 }, calle: 'Calle Junin', referencia: 'Frente a Medicity', tipo: 'automovil' },
      { id: 124, ubicacion: { lon: -78.143526, lat: 0.040802 }, calle: 'Calle Sucre', referencia: 'Autonomos puerta principal', tipo: 'motocicleta' },
      { id: 125, ubicacion: { lon: -78.143566, lat: 0.040824 }, calle: 'Calle 10 de agosto', referencia: 'Frente al colegio natalia Jarrin', tipo: 'especial' },
      { id: 126, ubicacion: { lon: -78.143803, lat: 0.040918 }, calle: 'Calle Vivar', referencia: 'Parque central frente a la iglesia', tipo: 'automovil' }
    ]; //0.040918, -78.143803

  }

  private asignarObjetoGeoJson() {
    let featuresArray = [];
    this.parkingLot().forEach((obj) => {
      let features = {//creacion de objeto features 
        id: null,
        type: "Feature",
        properties: null,
        geometry: {
          type: "Point",
          coordinates: null
        },
      };//objeto de feature elaborar un array de este objeto para asignar al parametro de features en la variable geojson
      features.properties = obj;
      features.id = obj.id;
      features.geometry.coordinates = [obj.ubicacion.lon, obj.ubicacion.lat];
      featuresArray.push(features);//add a un array
    });
    this.geojson.features = featuresArray;//anadir el array de features en el campo fetures del objeto geojson
    console.log('this.geojson: ', this.geojson);

  }

  geojson = {//estrucura de objeto geojson anadir un layer
    type: "FeatureCollection",
    features: null
  };



  public titlecaseTransform(cadena: string) {
    return this.titlecasePipe.transform(cadena);
  }


}//end class
