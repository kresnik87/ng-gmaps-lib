import {Component, OnInit} from '@angular/core';
import {Location} from '@ksk/ng-gmaps-lib';
import {Title} from '@angular/platform-browser';
import PlaceResult = google.maps.places.PlaceResult;
interface Marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-libs';
  zoom: number;
  lat: number;
  lng: number;

  constructor(private titleService: Title) {
  }

  ngOnInit() {
    this.titleService.setTitle('Home | google-maps-autocomplete');

    this.zoom = 10;
    this.lat = 52.520008;
    this.lng = 13.404954;

    this.setCurrentPosition();

  }
  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }
  onAutocompleteSelected(result: PlaceResult) {
    console.log('onAutocompleteSelected: ', result);
  }

  onLocationSelected(location: Location) {
    console.log('onLocationSelected: ', location);
    this.lat = location.latitude;
    this.lng = location.longitude;
  }
}
