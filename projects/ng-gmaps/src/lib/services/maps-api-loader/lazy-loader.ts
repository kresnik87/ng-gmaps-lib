import {Inject, Injectable, InjectionToken, Optional} from '@angular/core';

import {DocumentRef, WindowRef} from '../../utils/browser-globals';

import {MapsAPILoader} from './maps-api-loader';

export enum GoogleMapsScriptProtocol {
  HTTP = 1,
  HTTPS = 2,
  AUTO = 3,
}


export const LAZY_MAPS_CONFIG = new InjectionToken<LazyMapsAPILoaderConfigLiteral>('angular-google-maps LAZY_MAPS_API_CONFIG');

/**
 * Configuration for the {@link LazyAPILoader}.
 */
export interface LazyMapsAPILoaderConfigLiteral {
  /**
   * The Google Maps API Key (see:
   * https://developers.google.com/maps/documentation/javascript/get-api-key)
   */
  apiKey?: string;

  /**
   * Host and Path used for the `<script>` tag.
   */
  hostAndPath?: string;

  /**
   * Protocol used for the `<script>` tag.
   */
  protocol?: GoogleMapsScriptProtocol;

  /**
   * Defines which Google Maps libraries should get loaded.
   */
  libraries?: string[];

}

@Injectable()
export class LazyAPILoader extends MapsAPILoader {
  protected _scriptLoadingPromise: Promise<void>;
  protected _config: LazyMapsAPILoaderConfigLiteral;
  protected _windowRef: WindowRef;
  protected _documentRef: DocumentRef;
  protected readonly callbackName: string = `initMap`;

  constructor(@Optional() @Inject(LAZY_MAPS_CONFIG) config: any = null, w: WindowRef, d: DocumentRef) {
    super();
    this._config = config || {};
    this._windowRef = w;
    this._documentRef = d;
  }

  load(): Promise<void> {
    const window = this._windowRef.getNativeWindow() as any;
    if (window.google && window.google.maps) {
      // Google maps already loaded on the page.
      return Promise.resolve();
    }

    if (this._scriptLoadingPromise) {
      return this._scriptLoadingPromise;
    }

    const script = this._documentRef.getNativeDocument().createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.src = this._getScriptSrc(this.callbackName);
    this._assignScriptLoadingPromise(script);
    this._documentRef.getNativeDocument().body.appendChild(script);
    return this._scriptLoadingPromise;
  }

  protected _getScriptSrc(callbackName: string): string {
    let protocolType: GoogleMapsScriptProtocol =
      (this._config && this._config.protocol) || GoogleMapsScriptProtocol.HTTPS;
    let protocol: string;

    switch (protocolType) {
      case GoogleMapsScriptProtocol.AUTO:
        protocol = '';
        break;
      case GoogleMapsScriptProtocol.HTTP:
        protocol = 'http:';
        break;
      case GoogleMapsScriptProtocol.HTTPS:
        protocol = 'https:';
        break;
    }

    const hostAndPath: string = this._config.hostAndPath || 'maps.googleapis.com/maps/api/js';
    const queryParams: { [key: string]: string | string[] } = {
      callback: callbackName,
      key: this._config.apiKey,
      libraries: this._config.libraries
    };
    const params: string = Object.keys(queryParams)
      .filter((k: string) => queryParams[k] != null)
      .filter((k: string) => {
        // remove empty arrays
        return !Array.isArray(queryParams[k]) ||
          (Array.isArray(queryParams[k]) && queryParams[k].length > 0);
      })
      .map((k: string) => {
        // join arrays as comma seperated strings
        let i = queryParams[k];
        if (Array.isArray(i)) {
          return {key: k, value: i.join(',')};
        }
        return {key: k, value: queryParams[k]};
      })
      .map((entry: { key: string, value: string }) => {
        return `${entry.key}=${entry.value}`;
      })
      .join('&');
    return `${protocol}//${hostAndPath}?${params}`;
  }

  private _assignScriptLoadingPromise(scriptElem: HTMLElement) {
    this._scriptLoadingPromise = new Promise<void>((resolve: Function, reject: Function) => {
      (this._windowRef.getNativeWindow() as any)[this.callbackName] = () => {
        resolve();
      };

      scriptElem.onerror = (error: Event) => {
        reject(error);
      };
    });
  }
}
