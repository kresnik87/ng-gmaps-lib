/// <reference types="@types/googlemaps" />
import {Injectable, NgZone} from '@angular/core';
import {Observable, Observer} from 'rxjs';
import {MapsAPILoader} from '../services/maps-api-loader/maps-api-loader';

const _eQuatorialEarthRadius = 6378.1370;
const _d2r = (Math.PI / 180.0);

declare var google: any;

@Injectable()
export class GoogleMapsCore {
  private _map: Promise<google.maps.Map>;
  private _mapResolver: (value?: google.maps.Map) => void;


  constructor(private _loader: MapsAPILoader, private _zone: NgZone) {
    this._map =
      new Promise<google.maps.Map>((resolve: () => void) => {
        this._mapResolver = resolve;
      });
  }


  createMap(el: HTMLElement, mapOptions: google.maps.MapOptions): Promise<void> {
    return this._zone.runOutsideAngular(() => {
      return this._loader.load().then(() => {
        const map = new google.maps.Map(el, mapOptions);
        this._mapResolver(map as google.maps.Map);
        return;
      });
    });
  }

  setMapOptions(options: google.maps.MapOptions) {
    this._map.then((m: google.maps.Map) => {
      m.setOptions(options);
    });
  }

  createMarker(options: google.maps.MarkerOptions = {} as google.maps.MarkerOptions, addToMap: boolean = true):
    Promise<google.maps.Marker> {
    return this._map.then((map: google.maps.Map) => {
      if (addToMap) {
        options.map = map;
      }
      return new google.maps.Marker(options);
    });
  }


  createInfoWindow(options?: google.maps.InfoWindowOptions): Promise<google.maps.InfoWindow> {
    return this._map.then(() => {
      return new google.maps.InfoWindow(options);
    });
  }

  subscribeToMapEvent<E>(eventName: string): Observable<E> {
    return new Observable((observer: Observer<E>) => {
      this._map.then((m: google.maps.Map) => {
        m.addListener(eventName, (arg: E) => {
          this._zone.run(() => observer.next(arg));
        });
      });
    });
  }

  clearInstanceListeners() {
    this._map.then((map: google.maps.Map) => {
      google.maps.event.clearInstanceListeners(map);
    });
  }

  setCenter(latLng: google.maps.LatLngLiteral): Promise<void> {
    return this._map.then((map: google.maps.Map) => map.setCenter(latLng));
  }

  getZoom(): Promise<number> {
    return this._map.then((map: google.maps.Map) => map.getZoom());
  }

  getBounds(): Promise<google.maps.LatLngBounds> {
    return this._map.then((map: google.maps.Map) => map.getBounds());
  }

  getMapTypeId(): Promise<google.maps.MapTypeId | string> {
    return this._map.then((map: google.maps.Map) => map.getMapTypeId());
  }

  setZoom(zoom: number): Promise<void> {
    return this._map.then((map: google.maps.Map) => map.setZoom(zoom));
  }

  getCenter(): Promise<google.maps.LatLng> {
    return this._map.then((map: google.maps.Map) => map.getCenter());
  }

  panTo(latLng: google.maps.LatLng | google.maps.LatLngLiteral): Promise<void> {
    return this._map.then((map) => map.panTo(latLng));
  }

  panBy(x: number, y: number): Promise<void> {
    return this._map.then((map) => map.panBy(x, y));
  }

  fitBounds(latLng: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral): Promise<void> {
    return this._map.then((map) => map.fitBounds(latLng));
  }

  panToBounds(latLng: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral): Promise<void> {
    return this._map.then((map) => map.panToBounds(latLng));
  }

  /**
   * Returns the native Google Maps Map instance. Be careful when using this instance directly.
   */
  getNativeMap(): Promise<google.maps.Map> {
    return this._map;
  }

  /**
   * Triggers the given event name on the map instance.
   */
  triggerMapEvent(eventName: string): Promise<void> {
    return this._map.then((m) => google.maps.event.trigger(m, eventName));
  }

  getZipCodeFromLocation(location) {
    /*to use this function, add in google cloud console
     * geocoder api */
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({location: location}, function(results, status) {
      if (status === 'OK') {
        if (results[0]) {
          for (let i = 0; i < results.length; i++) {
            if (results[i].types[0] == 'postal_code') {
              console.log(results[i].address_components);
            }
          }

        }
      }
    });
  }

  getCalcDistance(location1: google.maps.LatLngLiteral, location2: google.maps.LatLngLiteral) {
    return this.calcDistanceHaversine(location1.lat, location1.lng, location2.lat, location2.lng, 'km');
  }

  calcDistanceHaversine(lat_origin, lng_origin, lat_target, lng_target, units: any) {
    let dlong = (lng_target - lng_origin) * _d2r;
    let dlat = (lat_target - lat_origin) * _d2r;
    let a = Math.pow(Math.sin(dlat / 2.0), 2.0) + Math.cos(lat_origin * _d2r) * Math.cos(lat_target * _d2r) * Math.pow(Math.sin(dlong / 2.0), 2.0);
    let c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
    let d = _eQuatorialEarthRadius * c;
    console.log(d);
    if (units == 'mts') {
      return (1000.0 * d).toFixed(2);
    } else {
      return d.toFixed(2);
    }

  }


}
