/// <reference types="@types/googlemaps" />
import {Injectable, NgZone} from '@angular/core';
import {Observable, Observer} from 'rxjs';

import {KskInfoWindow} from '../../component/info-window.component';

import {GoogleMapsCore} from '../../provider/google-maps';
import {MarkerManager} from './marker-manager';

@Injectable()
export class InfoWindowManager {
  private _infoWindows: Map<KskInfoWindow, Promise<google.maps.InfoWindow>> =
    new Map<KskInfoWindow, Promise<google.maps.InfoWindow>>();

  constructor(
    private _mapsCore: GoogleMapsCore, private _zone: NgZone,
    private _markerManager: MarkerManager) {
  }

  deleteInfoWindow(infoWindow: KskInfoWindow): Promise<void> {
    const iWindow = this._infoWindows.get(infoWindow);
    if (iWindow == null) {
      // info window already deleted
      return Promise.resolve();
    }
    return iWindow.then((i: google.maps.InfoWindow) => {
      return this._zone.run(() => {
        i.close();
        this._infoWindows.delete(infoWindow);
      });
    });
  }

  setPosition(infoWindow: KskInfoWindow): Promise<void> {
    return this._infoWindows.get(infoWindow).then((i: google.maps.InfoWindow) => i.setPosition({
      lat: infoWindow.latitude,
      lng: infoWindow.longitude,
    }));
  }

  setZIndex(infoWindow: KskInfoWindow): Promise<void> {
    return this._infoWindows.get(infoWindow)
      .then((i: google.maps.InfoWindow) => i.setZIndex(infoWindow.zIndex));
  }

  open(infoWindow: KskInfoWindow): Promise<void> {
    return this._infoWindows.get(infoWindow).then((w) => {
      if (infoWindow.hostMarker != null) {
        return this._markerManager.getNativeMarker(infoWindow.hostMarker).then((marker) => {
          return this._mapsCore.getNativeMap().then((map) => w.open(map, marker));
        });
      }
      return this._mapsCore.getNativeMap().then((map) => w.open(map));
    });
  }

  close(infoWindow: KskInfoWindow): Promise<void> {
    return this._infoWindows.get(infoWindow).then((w) => w.close());
  }

  setOptions(infoWindow: KskInfoWindow, options: google.maps.InfoWindowOptions) {
    return this._infoWindows.get(infoWindow).then((i: google.maps.InfoWindow) => i.setOptions(options));
  }

  addInfoWindow(infoWindow: KskInfoWindow) {
    const options: google.maps.InfoWindowOptions = {
      content: infoWindow.content,
      maxWidth: infoWindow.maxWidth,
      zIndex: infoWindow.zIndex,
      disableAutoPan: infoWindow.disableAutoPan,
    };
    if (typeof infoWindow.latitude === 'number' && typeof infoWindow.longitude === 'number') {
      options.position = {lat: infoWindow.latitude, lng: infoWindow.longitude};
    }
    const infoWindowPromise = this._mapsCore.createInfoWindow(options);
    this._infoWindows.set(infoWindow, infoWindowPromise);
  }

  /**
   * Creates a Google Maps event listener for the given InfoWindow as an Observable
   */
  createEventObservable<T>(eventName: string, infoWindow: KskInfoWindow): Observable<T> {
    return new Observable((observer: Observer<T>) => {
      this._infoWindows.get(infoWindow).then((i: google.maps.InfoWindow) => {
        i.addListener(eventName, (e: T) => this._zone.run(() => observer.next(e)));
      });
    });
  }
}
