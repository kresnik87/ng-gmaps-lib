# Ksk-Gmaps-Lib

Angular library for google maps based in main project AGM



##Configuration

```
import {GmapsLibModule} from "@ksk/ng-gmaps-lib";

imports: [
    ...
    GmapsLibModule.forRoot({
         apiKey:'YOUR_API_KEY'
       }),
    ...
  ],
```

##Usage Example
In your page, for use the library you need:
In HTML
```

<ksk-google-map
  [latitude]="lat"
  [longitude]="lng"
  [zoom]="zoom"
  [disableDefaultUI]="false"
  [zoomControl]="false"
  (mapClick)="mapClicked($event)">
  <ksk-google-marker
    *ngFor="let m of markers; let i = index"
    (markerClick)="clickedMarker(m.label, i)"
    [latitude]="m.lat"
    [longitude]="m.lng"
    [label]="m.label"
    [markerDraggable]="m.draggable"
    (dragEnd)="markerDragEnd(m, $event)">

    <ksk-info-window>
      <strong>InfoWindow content</strong>
    </ksk-info-window>

  </ksk-google-marker>
</ksk-google-map>

```
Always set css style to the map
In SCSS

````
ksk-google-map{
  height: 300px;
}

````
In TS

```
  zoom: number = 8;
  lat: number = 51.673858;
  lng: number = 7.815982;
  
  clickedMarker(label: string, index: number) {
      console.log(`clicked the marker: ${label || index}`)
    }
  
    mapClicked($event: MouseEvent) {
      this.markers.push({
        lat: $event.coords.lat,
        lng: $event.coords.lng,
        draggable: true
      });
    }
  
    markerDragEnd(m: marker, $event: MouseEvent) {
      console.log('dragEnd', m, $event);
    }
  
    markers: marker[] = [
      {
        lat: 51.673858,
        lng: 7.815982,
        label: 'A',
        draggable: false
      },
      {
        lat: 51.373858,
        lng: 7.215982,
        label: 'B',
        draggable: false
      },
      {
        lat: 51.723858,
        lng: 7.895982,
        label: 'C',
        draggable: true
      }
    ]
  
  
  interface marker {
    lat: number;
    lng: number;
    label?: string;
    draggable: boolean;
  }

```

##Credits
Created by:
    
*
    *[Jeyser Aguilar](https://github.com/kresnik87)*   (jeyser.aguilar@gmail.com) 

