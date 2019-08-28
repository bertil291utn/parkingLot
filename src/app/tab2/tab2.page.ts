import { Component } from '@angular/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.js';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoadingController, ToastController } from '@ionic/angular';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  accessToken: string = 'pk.eyJ1IjoiYmFydG8zODAiLCJhIjoiY2pzdjlub2NkMDRzdDN5bnp2N3Y0dnVmeCJ9.-9pWtrRt5xe5vVfXu6rQ3A';
  loadingMap;//loading controller mapa
  loadingParkingLayer;//loading layer cuand cancela o reserva una ruta ara qu vuelva a cargar
  footerEnable: boolean = false;
  propiedadesObject;//para los datos del footer
  map;//el mapa
  destinoParking;//destino para la creacion de la ruta 
  reservado: boolean = false;//para ver si esta reservado
  markerParking;//marcador para mostrar cuando hace click en un parking 
  dirEnable: boolean = true;//activar o desactivar el view de la direccion, inicia mostrando
  directions;//var para la direciones y rutas

  constructor(private geolocation: Geolocation, public loadingController: LoadingController, private titlecasePipe: TitleCasePipe
    , public toastController: ToastController) { }

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
    this.map = new mapboxgl.Map({
      container: 'map_canvas',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center, //-78.1571629,-0.0508833 // { lon: -78.1523295,lat:0.0388447 } -78.1523295,lat:0.0388447
      zoom: 15
    });

    // let marker = new mapboxgl.Marker()
    // .setLngLat(center)
    // .addTo(map);

    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));//anadir boton de ubicacion punto azul

    this.map.on('load', () => {
      this.asignarObjetoGeoJson();
      this.anadirLayerParking();
      this.loadingMap.dismiss();
    });//

    this.viewFooter();//mostrar footer con valores

  }//initmapbox

  public async estoyEstacionado() {
    this.loadingParkingLayer = await this.loadingController.create({
      message: 'Map loading...'
    });
    await this.loadingParkingLayer.present();
    this.anadirLayerParking();
    this.directions.removeRoutes();//remover las rutas
    document.getElementsByClassName("directions-control-instructions").item(0).remove();// remover as insutrcciones
    this.reservado = false//cambiar el estado de reservado
    this.footerEnable = false;//y deshabiliatr el footer
    //poner como reservado durante un minuto en la BD , si en ese tiempo el de la zona azul no pone como estacionado el puesto se libera 
    //pasado el un minuto comprobar si hay comprobacion por parte del senor de la zona azul 
    //cuando el zona azul pone estacionado directamente no hay necesidad de comprobacion 
    if (this.map.getLayer('parking'))
      if (this.loadingParkingLayer != null || undefined) {
        this.loadingParkingLayer.dismiss();
        console.log('usted se ha estacionado');
        let mensaje = 'Usted se enceuntra estacionado en el parking No. ' + this.propiedadesObject.id;
        this.actionPresentToast(mensaje, 2000);
      }
  }

  public async cancelarParking() {
    //para cancelar una ruta debe volver a anadir la fuente de datos y  la capa de los parkings (el dibujo)
    this.loadingParkingLayer = await this.loadingController.create({
      message: 'Map loading...'
    });
    await this.loadingParkingLayer.present();
    this.anadirLayerParking();
    this.directions.removeRoutes();//remover las rutas
    document.getElementsByClassName("directions-control-instructions").item(0).remove();// remover as insutrcciones
    // this.map.removeControl(this.directions);//remover la capa de controles
    this.reservado = false//cambiar el estado de reservado
    this.footerEnable = false;//y deshabiliatr el footer
    if (this.map.getLayer('parking'))
      if (this.loadingParkingLayer != null || undefined) {
        this.loadingParkingLayer.dismiss();
      }
  }


  public async gotoReservar() {
    let loadingRuta = await this.loadingController.create({
      message: 'Trazando ruta...'
    });
    await loadingRuta.present();

    this.reservado = true;//cambiar el estado a reervado
    //remover la fuente de datos de parking
    //remover la capa de dibujado de parkings
    this.map.removeLayer('parking');
    this.map.removeSource('tilequery')
    this.markerParking.remove();//remover el marker 
    const myLatLng = await this.getLocation();
    let center = { lon: myLatLng.lng, lat: myLatLng.lat };
    this.directions = new MapboxDirections({
      accessToken: this.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving-traffic',
      congestion: true,
      controls: { inputs: false },//desahbiliatr los controles de trafifc, bike, driving, etc
      language: 'es',
      interactive: false //que no se pueda manipular
    });
    this.directions.setOrigin([center.lon, center.lat]);
    this.directions.setDestination(this.destinoParking);
    this.map.addControl(this.directions, 'top-left');//anadir en el mapa
    this.directions.on('route', () => {
      loadingRuta.dismiss();
    });
    //deshabilitar el objeto de las  direcciones (el cuadro flotante negro)
    let instructions = document.getElementsByClassName("directions-control-instructions");
    instructions[0]['hidden'] = true;
  }

  public showHideInstruccionsDir() {
    //mostra u ocultar el objeto de direcicones 
    let instructions = document.getElementsByClassName("directions-control-instructions");
    if (instructions[0]['hidden'])
      instructions[0]['hidden'] = false;
    else
      instructions[0]['hidden'] = true;
  }

  public showHideDir() {
    //mostrar u ocultar el div de direcciones en la aprte de abajo
    if (this.dirEnable)
      this.dirEnable = false;
    else
      this.dirEnable = true;
  }

  private viewFooter() {
    //ver las drieecciones una vez que presiona en un parking especifico 
    this.markerParking = new mapboxgl.Marker();
    this.map.on('click', () => {
      if (this.footerEnable && !this.reservado) {
        this.markerParking.remove();
        this.footerEnable = false;
      }
    });//verificar si hace click en el map y si ha dado click a cualquier de los estacionamientos, se  va a quitar el foot y el marker

    //cuando presiona en el layer del parking 
    //enviar val propiedadesobject para mostra en el footer y anadir el marker
    this.map.on('click', 'parking', (e) => {
      var coordinates = e.features[0].geometry.coordinates.slice();
      this.destinoParking = coordinates;
      this.propiedadesObject = e.features[0].properties;
      this.markerParking.setLngLat(coordinates)
        .addTo(this.map);
      this.footerEnable = true;
    });



    // this.map.on('click', 'parking', (e) => {
    //   // var title = '<h3><strong>No. </strong>' + e.features[0].properties.id + '</h3>';
    //   // var storeAddress = '<p><strong>Tipo. </strong>' + this.titlecaseTransform(e.features[0].properties.tipo) + '</p>';
    //   var coordinates = e.features[0].geometry.coordinates.slice();
    //   this.destinoParking = coordinates;
    //   // var content = title + storeAddress;

    //   // popup.setLngLat(coordinates)
    //   //   .setHTML(content)
    //   //   .addTo(map);
    //   this.propiedadesObject = e.features[0].properties;
    //   // console.log('e.features[0].propiedades: ', e.features[0].propiedades);
    //   this.markerParking.setLngLat(coordinates)
    //     .addTo(this.map);
    //   this.footerEnable = true;
    // });
  }

  private anadirLayerParking() {
    this.map.addSource('tilequery', { //crear una fuente de tipo geojson ,de nombre tilequery
      type: "geojson",
      data: this.geojson
    });
    this.addLayer();//crear el layer en el mapa
  }

  private addLayer() {
    this.map.addLayer({
      id: "parking",
      type: "circle",
      source: "tilequery",
      paint: {
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
        "circle-color": [
          'match',
          ['get', 'tipo'],
          'automovil', '#FF8C00',
          'motocicleta', '#9ACD32',
          'especial', '#008000',
          '#FF0000'
        ]
      }
    });
    //cuando el loadin parking se haya activado
    // if (this.map.getLayer('parking'))
    //   if (this.loadingParkingLayer != null || undefined)
    //     this.loadingParkingLayer.dismiss();
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

  }

  geojson = {//estrucura de objeto geojson anadir un layer
    type: "FeatureCollection",
    features: null
  };



  public titlecaseTransform(cadena: string) {
    return this.titlecasePipe.transform(cadena);
  }



  private async actionPresentToast(mensaje: string, duration: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: duration
    });
    toast.present();
  }
}//end class
