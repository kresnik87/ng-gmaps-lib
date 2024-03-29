/// <reference types="@types/googlemaps" />
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChange
} from '@angular/core';
import {Observable, ReplaySubject, Subscription} from 'rxjs';
import {MouseEvent} from '../types';
import {FitBoundsAccessor, FitBoundsDetails} from '../services/fit-bounds';
import {MarkerManager} from '../services/managers/marker-manager';
import {KskInfoWindow} from './info-window.component';

let markerId = 0;

@Directive({
  selector: 'ksk-google-marker',
  providers: [
    {provide: FitBoundsAccessor, useExisting: forwardRef(() => KskMarker)},
  ],
  inputs: [
    'latitude', 'longitude', 'title', 'label', 'draggable: markerDraggable', 'iconUrl',
    'openInfoWindow', 'opacity', 'visible', 'zIndex', 'animation',
  ],
  outputs: ['markerClick', 'dragStart', 'drag', 'dragEnd', 'mouseOver', 'mouseOut'],
})
export class KskMarker implements OnDestroy, OnChanges, AfterContentInit, FitBoundsAccessor
{
  /**
   * The latitude position of the marker.
   */
  @Input() latitude: number;

  /**
   * The longitude position of the marker.
   */
  @Input() longitude: number;

  /**
   * The title of the marker.
   */
  @Input() title: string;

  /**
   * The label (a single uppercase character) for the marker.
   */
  @Input() label: string | google.maps.MarkerLabel;

  /**
   * If true, the marker can be dragged. Default value is false.
   */
    // tslint:disable-next-line:no-input-rename
  @Input('markerDraggable') draggable: boolean = false;

  /**
   * Icon (the URL of the image) for the foreground.
   */
  @Input() iconUrl: string;

  /**
   * If true, the marker is visible
   */
  @Input() visible: boolean = true;

  /**
   * Whether to automatically open the child info window when the marker is clicked.
   */
  @Input() openInfoWindow: boolean = true;

  /**
   * The marker's opacity between 0.0 and 1.0.
   */
  @Input() opacity: number = 1;

  /**
   * All markers are displayed on the map in order of their zIndex, with higher values displaying in
   * front of markers with lower values. By default, markers are displayed according to their
   * vertical position on screen, with lower markers appearing in front of markers further up the
   * screen.
   */
  @Input() zIndex: number = 1;

  /**
   * If true, the marker can be clicked. Default value is true.
   */
    // tslint:disable-next-line:no-input-rename
  @Input('markerClickable') clickable: boolean = true;

  /**
   * Which animation to play when marker is added to a map.
   * This can be 'BOUNCE' or 'DROP'
   */
  animation: 'BOUNCE' | 'DROP' | null;

  /**
   * This event emitter gets emitted when the user clicks on the marker.
   */
  @Output() markerClick: EventEmitter<KskMarker> = new EventEmitter<KskMarker>();

  /**
   * This event is fired when the user rightclicks on the marker.
   */
  @Output() markerRightClick: EventEmitter<void> = new EventEmitter<void>();

  /**
   * This event is fired when the user starts dragging the marker.
   */
  @Output() dragStart: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  /**
   * This event is repeatedly fired while the user drags the marker.
   */
  @Output() drag: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  /**
   * This event is fired when the user stops dragging the marker.
   */
  @Output() dragEnd: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  /**
   * This event is fired when the user mouses over the marker.
   */
  @Output() mouseOver: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  /**
   * This event is fired when the user mouses outside the marker.
   */
  @Output() mouseOut: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  /** @internal */
  @ContentChildren(KskInfoWindow) infoWindow: QueryList<KskInfoWindow> = new QueryList<KskInfoWindow>();
  protected readonly _fitBoundsDetails$: ReplaySubject<FitBoundsDetails> = new ReplaySubject<FitBoundsDetails>(1);
  private _markerAddedToManager: boolean = false;
  private _id: string;
  private _observableSubscriptions: Subscription[] = [];

  constructor(private _markerManager: MarkerManager)
  {
    this._id = (markerId++).toString();
  }

  /* @internal */
  ngAfterContentInit()
  {
    this.handleInfoWindowUpdate();
    this.infoWindow.changes.subscribe(() => this.handleInfoWindowUpdate());
  }

  /** @internal */
  ngOnChanges(changes: { [key: string]: SimpleChange })
  {
    if (typeof this.latitude === 'string')
    {
      this.latitude = Number(this.latitude);
    }
    if (typeof this.longitude === 'string')
    {
      this.longitude = Number(this.longitude);
    }
    if (typeof this.latitude !== 'number' || typeof this.longitude !== 'number')
    {
      return;
    }
    if (!this._markerAddedToManager)
    {
      this._markerManager.addMarker(this);
      this._updateFitBoundsDetails();
      this._markerAddedToManager = true;
      this._addEventListeners();
      return;
    }
    if (changes['latitude'] || changes['longitude'])
    {
      this._markerManager.updateMarkerPosition(this);
      this._updateFitBoundsDetails();
    }
    if (changes['title'])
    {
      this._markerManager.updateTitle(this);
    }
    if (changes['label'])
    {
      this._markerManager.updateLabel(this);
    }
    if (changes['draggable'])
    {
      this._markerManager.updateDraggable(this);
    }
    if (changes['iconUrl'])
    {
      this._markerManager.updateIcon(this);
    }
    if (changes['opacity'])
    {
      this._markerManager.updateOpacity(this);
    }
    if (changes['visible'])
    {
      this._markerManager.updateVisible(this);
    }
    if (changes['zIndex'])
    {
      this._markerManager.updateZIndex(this);
    }
    if (changes['clickable'])
    {
      this._markerManager.updateClickable(this);
    }
    if (changes['animation'])
    {
      this._markerManager.updateAnimation(this);
    }
  }

  /** @internal */
  getFitBoundsDetails$(): Observable<FitBoundsDetails>
  {
    return this._fitBoundsDetails$.asObservable();
  }

  /** @internal */
  id(): string
  {
    return this._id;
  }

  /** @internal */
  toString(): string
  {
    return 'KskMarker-' + this._id.toString();
  }

  /** @internal */
  ngOnDestroy()
  {
    this._markerManager.deleteMarker(this);
    // unsubscribe all registered observable subscriptions
    this._observableSubscriptions.forEach((s) => s.unsubscribe());
  }

  protected _updateFitBoundsDetails()
  {
    this._fitBoundsDetails$.next({latLng: {lat: this.latitude, lng: this.longitude}});
  }

  private handleInfoWindowUpdate()
  {
    if (this.infoWindow.length > 1)
    {
      throw new Error('Expected no more than one info window.');
    }
    this.infoWindow.forEach(marker =>
    {
      marker.hostMarker = this;
    });
  }

  private _addEventListeners()
  {
    const cs = this._markerManager.createEventObservable('click', this).subscribe(() =>
    {
      if (this.openInfoWindow)
      {
        this.infoWindow.forEach(infoWindow => infoWindow.open());
      }
      this.markerClick.emit(this);
    });
    this._observableSubscriptions.push(cs);

    const rc = this._markerManager.createEventObservable('rightclick', this).subscribe(() =>
    {
      this.markerRightClick.emit(null);
    });
    this._observableSubscriptions.push(rc);

    const ds =
      this._markerManager.createEventObservable<google.maps.MouseEvent>('dragstart', this)
        .subscribe((e: google.maps.MouseEvent) =>
        {
          this.dragStart.emit({coords: {lat: e.latLng.lat(), lng: e.latLng.lng()}} as MouseEvent);
        });
    this._observableSubscriptions.push(ds);

    const d =
      this._markerManager.createEventObservable<google.maps.MouseEvent>('drag', this)
        .subscribe((e: google.maps.MouseEvent) =>
        {
          this.drag.emit({coords: {lat: e.latLng.lat(), lng: e.latLng.lng()}} as MouseEvent);
        });
    this._observableSubscriptions.push(d);

    const de =
      this._markerManager.createEventObservable<google.maps.MouseEvent>('dragend', this)
        .subscribe((e: google.maps.MouseEvent) =>
        {
          this.dragEnd.emit({coords: {lat: e.latLng.lat(), lng: e.latLng.lng()}} as MouseEvent);
        });
    this._observableSubscriptions.push(de);

    const mover =
      this._markerManager.createEventObservable<google.maps.MouseEvent>('mouseover', this)
        .subscribe((e: google.maps.MouseEvent) =>
        {
          this.mouseOver.emit({coords: {lat: e.latLng.lat(), lng: e.latLng.lng()}} as MouseEvent);
        });
    this._observableSubscriptions.push(mover);

    const mout =
      this._markerManager.createEventObservable<google.maps.MouseEvent>('mouseout', this)
        .subscribe((e: google.maps.MouseEvent) =>
        {
          this.mouseOut.emit({coords: {lat: e.latLng.lat(), lng: e.latLng.lng()}} as MouseEvent);
        });
    this._observableSubscriptions.push(mout);
  }
}
