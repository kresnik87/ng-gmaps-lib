import {ModuleWithProviders, NgModule} from '@angular/core';
import {KskMap} from './component/maps.component';
import {KskMarker} from './component/marker.component';
import {KskInfoWindow} from './component/info-window.component';
import {GmapsAutocompleteComponent} from './component/gmaps-autocomplete.component';
import {LAZY_MAPS_CONFIG, LazyAPILoader, LazyMapsAPILoaderConfigLiteral} from './services/maps-api-loader/lazy-loader';
import {MapsAPILoader} from './services/maps-api-loader/maps-api-loader';
import {BROWSER_GLOBALS_PROVIDERS} from './utils/browser-globals';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material';
import {GoogleMapsAutocompleteDirective} from './directives/gmaps-autocomplete.directive';
import {ValidateAddressDirective} from './directives/address-validator/addres-validator.directive';

@NgModule({
  declarations: [
    KskMap,
    KskMarker,
    KskInfoWindow,
    GmapsAutocompleteComponent,
    GoogleMapsAutocompleteDirective,
    ValidateAddressDirective
    ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  exports: [
    KskMap,
    KskMarker,
    KskInfoWindow,
    GmapsAutocompleteComponent,
    GoogleMapsAutocompleteDirective,
    ValidateAddressDirective]
})
export class GmapsLibModule {
  static forRoot(lazyMapsLoaderConfig: LazyMapsAPILoaderConfigLiteral): ModuleWithProviders {
    return {
      ngModule: GmapsLibModule,
      providers: [
        BROWSER_GLOBALS_PROVIDERS,
        {
          provide: MapsAPILoader,
          useClass: LazyAPILoader
        }, {
          provide: LAZY_MAPS_CONFIG,
          useValue: lazyMapsLoaderConfig
        }
      ]
    };
  }
}
