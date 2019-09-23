import { Component } from '@angular/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.js';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoadingController, ToastController } from '@ionic/angular';
import { TitleCasePipe, NgSwitchCase } from '@angular/common';
import * as $ from "jquery";
import { ApirestserviceService } from '../services/apirestservice.service';

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
  geojsonaux;//valor global auxiliar para pintar en 
  tipoAutomovil = 0;
  geolocate; //boton azul de ubicacion 
  brujula;//boton de burjula pararegresar a laroeientaicon original al mapa
  currentMarkers = [];//tods los marcadores que sestan en el mapa (autmo,moto,especial)

  constructor(private geolocation: Geolocation, public loadingController: LoadingController, private titlecasePipe: TitleCasePipe
    , public toastController: ToastController, public apirestservice: ApirestserviceService) {


  }

  ngOnInit() {
    this.initMapBox();
  }

  async initMapBox() {
    this.loadingMap = await this.loadingController.create({
      message: 'Map loading...'
    });

    await this.loadingMap.present();
    const myLatLng = await this.getLocation();
    // console.log('mylocation: ', myLatLng);
    // console.log('parkings: ', this.parkingLot());

    let center = { lon: myLatLng.lng, lat: myLatLng.lat };

    mapboxgl.accessToken = this.accessToken;
    this.map = new mapboxgl.Map({
      container: 'map_canvas',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,//{ lon: -78.143721, lat: 0.040875 },//center, //-78.1571629,-0.0508833 // { lon: -78.1523295,lat:0.0388447 } -78.1523295,lat:0.0388447
      zoom: 15
    });

    // let marker = new mapboxgl.Marker()
    // .setLngLat(center)
    // .addTo(map);
    //iniciar varible para geolocate, para qe se pisible anadir metodos cmo trigger
    this.addGeolocateControl();


    //esconder logo de mapbox
    let mapboxTag = document.getElementsByClassName("mapboxgl-ctrl-bottom-left");
    mapboxTag[0]['style'].display = 'none';


    this.map.on('load', async () => {
      // this.asignarObjetoGeoJson();
      await this.anadirLayerParking();
      this.loadingMap.dismiss();
      this.geolocate.trigger();//quitar comnentario
    });//


    // this.viewFooter();//mostrar footer con valores

  }//initmapbox

  public async estoyEstacionado() {
    this.loadingParkingLayer = await this.loadingController.create({
      message: 'Map loading...'
    });
    await this.loadingParkingLayer.present();
    this.addGeolocateControl();
    await this.anadirLayerParking();
    this.geolocate.trigger();//lanzar ubicacion actual
    this.directions.removeRoutes();//remover las rutas
    document.getElementsByClassName("directions-control-instructions").item(0).remove();// remover as insutrcciones
    this.reservado = false//cambiar el estado de reservado
    this.footerEnable = false;//y deshabiliatr el footer
    //poner como reservado durante un minuto en la BD , si en ese tiempo el de la zona azul no pone como estacionado el puesto se libera 
    //pasado el un minuto comprobar si hay comprobacion por parte del senor de la zona azul 
    //cuando el zona azul pone estacionado directamente no hay necesidad de comprobacion 
    let mensaje = 'Usted se encuentra estacionado en el parking No. ' + this.propiedadesObject.adicional.id;
    this.actionPresentToast(mensaje, 4000);


    // if (this.map.getLayer('parking'))
    //   if (this.loadingParkingLayer != null || undefined) {
    //     console.log('usted se ha estacionado');
    //     this.loadingParkingLayer.dismiss();
    //   }
  }

  public async cancelarParking() {
    //para cancelar una ruta debe volver a anadir la fuente de datos y  la capa de los parkings (el dibujo)
    this.loadingParkingLayer = await this.loadingController.create({
      message: 'Map loading...'
    });
    await this.loadingParkingLayer.present();
    //this.addLayer();
    this.addGeolocateControl();
    await this.anadirLayerParking();
    this.directions.removeRoutes();//remover las rutas
    document.getElementsByClassName("directions-control-instructions").item(0).remove();// remover as insutrcciones
    // this.map.removeControl(this.directions);//remover la capa de controles
    this.reservado = false//cambiar el estado de reservado
    this.footerEnable = false;//y deshabiliatr el footer
    this.geolocate.trigger();//quitar comnentario
    // console.log('out getlayer');
    // console.log('this.map.getLayer()',this.map.getLayer('parking'));
    // if (this.map.getLayer('parking')) {
    //   if (this.loadingParkingLayer != null || undefined) {
    //     console.log('in2');
    //     this.loadingParkingLayer.dismiss();
    //   }
    // }
  }


  public async gotoReservar() {
    let loadingRuta = await this.loadingController.create({
      message: 'Trazando ruta...'
    });
    await loadingRuta.present();

    this.reservado = true;//cambiar el estado a reervado
    //remover la fuente de datos de parking
    //remover la capa de dibujado de parkings
    // this.map.removeLayer('parking');
    // this.map.removeSource('tilequery');
    //quitar boton azul de ubicacion y brujula
    // this.markerParking.remove();//remover el marker 
    this.map.removeControl(this.geolocate);
    this.map.removeControl(this.brujula);
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
    //de acuerdo ala evento de rutas anadir en el objeto duration y distancia para mostrar en el view
    this.directions.on('route', (resp) => {
      resp = resp.route[0];
      this.propiedadesObject.navegacion.duration = resp.duration;
      this.propiedadesObject.navegacion.distance = resp.distance;
      this.propiedadesObject.navegacion.distance = Math.round(this.propiedadesObject.navegacion.distance);
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
      this.propiedadesObject = { navegacion: { duration: null, distance: null }, adicional: null }
      var coordinates = e.features[0].geometry.coordinates.slice();
      this.destinoParking = coordinates;
      this.propiedadesObject.adicional = e.features[0].properties;
      this.markerParking.setLngLat(coordinates)
        .addTo(this.map);
      this.footerEnable = true;
      this.gotoReservar();//al momento de dar click en el parking directamnte crear la ruta
      // this.httpreqParking();
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

  private async  httpTitleReqParking() {
    //obtiene los lugares mas cercanos de acuerdo a un radio dado estblecido junto asu ubicacion actual 
    // var tileset = 'barto380.71fbj6ni'; // replace this with the ID of the tileset you created//esta direccion tarrer desde una bd mediante api rest
    // var radius = 500; // 1609 meters is roughly equal to one mile
    // var limit = 20; // The maximu
    const myLatLng = await this.getLocation();

    // var query = 'https://api.mapbox.com/v4/' + tileset + '/tilequery/' + myLatLng.lng + ',' + myLatLng.lat + '.json?radius=' + radius + '&limit=' + limit + '&access_token=' + this.accessToken;
    //1000 en limite para que no haya limite. Este es usado para el metodo de los dos parkings mas cercanos para que traiga solo los 10 primeros registros
    //m_around metros a la redonda 100m de radio 
    var query = `https://wsparking.herokuapp.com/nearby_parking?lon=${myLatLng.lng}&lat=${myLatLng.lat}&tipo=${this.tipoAutomovil}&m_around=100&limite=1000`;
    // var query = 'https://wsparking.herokuapp.com/parqueaderos/';
    let response = await fetch(query);
    this.geojsonaux = await response.json();


    // await $.ajax({
    //   method: 'GET',
    //   url: query
    // }).done((data) => {
    //   // console.log('query httpparking: ', data);
    //   this.geojsonaux = data;
    //   // this.selectParkingaAs(+this.tipoAutomovil);
    //   // this.geojson = data;
    //   // Code from the next step will go here
    // })



    //   this.geojsonaux =
    //     await this.apirestservice.nearbySearch(myLatLng.lng, myLatLng.lat, +this.tipoAutomovil).then((resp) => {

    //       console.log('query httpparking: ', resp);
    //     });
    //   console.log('query httpparking: ', this.geojsonaux);
  }

  public async changeState(estado) {
    // this.selectParkingaAs(this.tipoAutomovil);
    //remover todos los datos  del mapa
    // this.map.removeLayer('parking');
    // this.map.removeSource('tilequery');
    this.tipoAutomovil = estado;
    this.removeallMarker(this.currentMarkers);
    this.map.removeControl(this.geolocate);//ubicacion boton azul
    this.map.removeControl(this.brujula);//
    this.addGeolocateControl();//anadir el vento 
    await this.anadirLayerParking();
    this.geolocate.trigger();
  }

  private addGeolocateControl() {
    //anadir el control de ubicacion actial al mapa
    this.geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true //para que que el bton azul cambie cuando se mueva
    });
    this.map.addControl(this.geolocate);
    // let instructions = document.getElementsByClassName("mapboxgl-ctrl");
    // instructions[0]['style'].display = 'none';

    //anadir la brujula en el mapa para reotientar el mapa
    this.brujula = new mapboxgl.NavigationControl({ showZoom: false });
    this.map.addControl(this.brujula, 'top-right');
  }

  private async httpDistanceReq() {
    //de acuerdo a la ubicacion actual y de todos los puntos alredeodr, se calcula cual de todos ellos esta ams cerc a su ubicaicon actual
    const myLatLng = await this.getLocation();
    let puntos = myLatLng.lng + ',' + myLatLng.lat + ';';//incluido ubicaciojn actual como primer parametro
    let npuntos = '';
    this.geojsonaux.forEach((element, idx, array) => {
      let semicolon = ';';
      if (idx === array.length - 1) {//the last item in the array
        semicolon = '';
      }
      puntos += element.longitude + ',' + element.latitude + semicolon;
      npuntos += (idx + 1) + semicolon;
    });
    // console.log('puntos: ', puntos);
    // console.log('npuntos: ', npuntos);
    var query = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${puntos}?sources=0&destinations=${npuntos}&annotations=duration,distance&access_token=` + this.accessToken;
    
    let response = await fetch(query);
    let data = await response.json();
    this.bestLocationParking(data.distances[0]);

    // await $.ajax({
    //   method: 'GET',
    //   url: query,
    // }).done((data) => {
    //   // console.log('query httprepondse: ', data);
    //   this.bestLocationParking(data.distances[0]);//del arrya d edistancias buscar los dos que sean mas cercanos
    //   // this.geojson = data;
    //   // console.log('thisgeojson: ', this.geojson);
    //   // Code from the next step will go here
    // })

  }

  private bestLocationParking(arrayDDuration) {
    //buscar los lugares mas cercanos del array de distancias recibido de la respuesta del api
    //las rspuets del api de distancas se reciben  en el orden normaledel geojsn auxiliar o temporal
    //el geojson va ser temporal por que al final se vuelve agregar los features (al geojson original) en el nueov geojson object que devuelven de acuerdo alos puntos mas cercanos antes calculados

    let keyLocationArray = [];//array para almacenar los indices de los indices de la respuesta de distancias 
    let min;
    // let secondmin;
    let comparacion;//variable para alamcenar en el for si es minimo o el segundo minimo 

    for (let index = 0; index < 2; index++) {//un for de bucle dos pr acalcualr el minimo y el segundo minimo, para no hacer el mismo proceos dos vesces
      if (index == 0) {//si es dnice cero es para la primera osea el minimo
        min = Math.min.apply(null, arrayDDuration);//calcular el minimo
        comparacion = min
        console.log('minimo: ' + min);
      } else {
        comparacion = Math.min.apply(null, arrayDDuration.filter(n => n != min));//cacular el segundo minimo del array
        console.log('secondminimo: ' + comparacion);
      }
      arrayDDuration.forEach((val, index) => {
        if (val == comparacion)//buscar en el array de duration, los indices de los valors minimo y segundo minimo, para luego  anadir en el array de keylocation 
          keyLocationArray.push(index);
      });
    }
    // console.log('keyLocationArray: ', keyLocationArray);
    let featuresArray = [];
    keyLocationArray.forEach((valKey) => {
      this.geojsonaux.forEach((valgeojson, index) => {//buscar en el array de features(geojson auxiliar) los indices desde el arrya keylocationarray 
        if (valKey == index)
          featuresArray.push(valgeojson);//si es que es igual al encontrado anadir el objeto de en el variable de features
      });
    });
    this.geojsonaux = featuresArray; //aandir el array de features en el campo features del obejto geojson, para posteriormente manda r a dibujar solo este obejto 
    this.asignarObjetoGeoJson();
    // console.log('key location : ', keyLocationArray);
    // console.log('geojson : ', this.geojsonaux);
  }



  private async anadirLayerParking() {
    await this.httpTitleReqParking();
    this.asignarObjetoGeoJson();
    // await this.httpDistanceReq();

    // this.addLayer();//crear el layer en el mapa
    this.addcustomMarkers();
  }

  private addcustomMarkers() {
    // console.log('geosjo: ', this.geojson);

    this.geojson.features.forEach((marker) => {

      // create a DOM element for the marker
      let el = document.createElement('img');
      el.className = 'marker';
      let tipo = '';
      if (marker.properties.id_tipo == 1)
        tipo = 'car.png';
      else if (marker.properties.id_tipo == 2)
        tipo = 'special.png';
      else
        tipo = 'motorbike.png';
      // el.style.backgroundImage = 'url(./../assets/parkingicons/' + tipo + ')';
      el.src = 'assets/parkingicons/' + tipo;
      el.style.width = '40px';
      el.style.height = '40px';
      // add marker temp to map
      var oneMarker = new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(this.map);
      // save tmp marker into currentMarkers
      this.currentMarkers.push(oneMarker);


      el.addEventListener('click', () => {
        // remove markers 
        this.removeallMarker(this.currentMarkers);
        this.propiedadesObject = { navegacion: { duration: null, distance: null }, adicional: null }
        // console.log('marker object: ', marker);
        var coordinates = marker.geometry.coordinates.slice();
        this.destinoParking = coordinates;
        this.propiedadesObject.adicional = marker.properties;
        // this.markerParking.setLngLat(coordinates)
        //   .addTo(this.map);
        this.footerEnable = true;
        this.gotoReservar();//al momento de dar click en el parking directamnte crear la ruta
        // this.httpreqParking();
      });
    });
    // console.log('currentmarker: ', currentMarkers);

    //cuando el loadin parking se haya activado

    if (this.loadingParkingLayer != null || undefined)
      this.loadingParkingLayer.dismiss();
  }

  private removeallMarker(currentMarkers) {
    // console.log('currrent markers', currentMarkers);
    if (currentMarkers !== null) {
      for (var i = 0; i < currentMarkers.length; i++) {
        currentMarkers[i].remove();
        // console.log('index', i);
      }
    }
  }

  private addLayer() {
    this.map.addSource('tilequery', { //crear una fuente de tipo geojson ,de nombre tilequery
      type: "geojson",
      data: this.geojson
    });
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
          ['get', 'id_tipo'],
          '1', '#FF8C00',
          '3', '#9ACD32',
          '2', '#008000',
          '#FF0000'
        ]
      }
    });
    //cuando el loadin parking se haya activado
    if (this.map.getLayer('parking'))
      if (this.loadingParkingLayer != null || undefined)
        this.loadingParkingLayer.dismiss();
  }

  private async getLocation() {
    const rta = await this.geolocation.getCurrentPosition();
    let latLng = { lat: rta.coords.latitude, lng: rta.coords.longitude };
    return latLng
  }

  private parkingLot() {//traer datos desde la misma bd unicamente los parkings que no estan ocupados
    return [
      { id: 123, ubicacion: { lon: -78.143721, lat: 0.040875 }, calle: 'Calle Sucre', referencia: 'Frente a Medicity', tipo: 'automovil' },
      { id: 124, ubicacion: { lon: -78.143526, lat: 0.040802 }, calle: 'Calle Sucre', referencia: 'Autonomos puerta principal', tipo: 'motocicleta' },
      { id: 125, ubicacion: { lon: -78.143566, lat: 0.040824 }, calle: 'Calle Sucre', referencia: 'Frente al colegio natalia Jarrin', tipo: 'especial' },
      { id: 126, ubicacion: { lon: -78.143803, lat: 0.040918 }, calle: 'Calle Sucre', referencia: 'Parque central frente a la iglesia', tipo: 'automovil' },
      { id: 127, ubicacion: { lon: -78.143905, lat: 0.041621 }, calle: 'Calle Ascazubi', referencia: 'frente a comandato', tipo: 'motocicleta' },
      { id: 128, ubicacion: { lon: -78.143924, lat: 0.041563 }, calle: 'Calle Ascazubi', referencia: 'frente a alamacenes la ganga', tipo: 'automovil' },
      { id: 129, ubicacion: { lon: -78.143945, lat: 0.041483 }, calle: 'Calle Ascazubi', referencia: 'frente al banco pichincha ', tipo: 'automovil' },
      { id: 130, ubicacion: { lon: -78.143977, lat: 0.041390 }, calle: 'Calle Ascazubi', referencia: 'frente a artefacta', tipo: 'automovil' },
      { id: 131, ubicacion: { lon: -78.143598, lat: 0.041676 }, calle: 'Calle Bolivar', referencia: 'frente a la vaca loca', tipo: 'automovil' },
      { id: 132, ubicacion: { lon: -78.143534, lat: 0.041652 }, calle: 'Calle Bolivar', referencia: 'frente a artefacta', tipo: 'automovil' },
      { id: 133, ubicacion: { lon: -78.143444, lat: 0.041609 }, calle: 'Calle Bolivar', referencia: 'frente a tienda el mono', tipo: 'automovil' },
      { id: 134, ubicacion: { lon: -78.143414, lat: 0.041604 }, calle: 'Calle Bolivar', referencia: 'esquina del semaforo', tipo: 'automovil' },
      { id: 135, ubicacion: { lon: -78.143145, lat: 0.041260 }, calle: 'Calle Rocafuerte', referencia: 'cooperativa 23 de julio', tipo: 'motocicleta' },
      { id: 136, ubicacion: { lon: -78.143159, lat: 0.041244 }, calle: 'Calle Rocafuerte', referencia: 'tienda 1', tipo: 'motocicleta' },
      { id: 137, ubicacion: { lon: -78.143176, lat: 0.041183 }, calle: 'Calle Rocafuerte', referencia: 'tienda 2', tipo: 'automovil' },
      { id: 138, ubicacion: { lon: -78.143191, lat: 0.041131 }, calle: 'Calle Rocafuerte', referencia: 'tienda 3', tipo: 'automovil' }
    ]; //0.040918, -78.143803

  }

  private asignarObjetoGeoJson() {
    let featuresArray = [];
    this.geojsonaux.forEach((obj) => {
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
      features.id = +obj.id;
      features.geometry.coordinates = [+obj.longitude, +obj.latitude];
      featuresArray.push(features);//add a un array
    });
    this.geojson.features = featuresArray;//anadir el array de features en el campo fetures del objeto geojson
    // console.log('geojson: ' ,this.geojson);
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


  public sectoMin(sec: number): string {
    if (sec < 60)//si segundos es menor a 60 que ponga directamente los segundos
      return Math.round(sec) + ' s';
    else
      return Math.round(sec / 60) + ' min';
  }

  private selectParkingaAs(tipoAutomovil: number) {
    let tipo;
    switch (tipoAutomovil) {
      case 1: {
        tipo = 'automovil'
        break;
      }
      case 2: {
        tipo = 'especial'
        break;
      }
      case 3: {
        tipo = 'motocicleta'
        break;
      }
    }

    this.geojsonaux = this.geojsonaux.features.filter((val) => val.properties.tipo == tipo);
  }


}//end class
