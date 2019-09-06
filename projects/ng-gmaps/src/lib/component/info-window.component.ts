import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange
} from '@angular/core';

import {InfoWindowManager} from '../services/managers/info-window-manager';

import {KskMarker} from './marker.component';

let infoWindowId = 0;


@Component({
  selector: 'ksk-info-window',
  template: `
    <div class='ksk-info-window-content'>
      <ng-content></ng-content>
    </div>
  `,
})
export class KskInfoWindow implements OnDestroy, OnChanges, OnInit
{
  private static _infoWindowOptionsInputs: string[] = ['disableAutoPan', 'maxWidth'];
  /**
   * The latitude position of the info window (only usefull if you use it ouside of a {@link
    * KskMarker}).
   */
  @Input() latitude: number;
  /**
   * The longitude position of the info window (only usefull if you use it ouside of a {@link
    * KskMarker}).
   */
  @Input() longitude: number;
  /**
   * Disable auto-pan on open. By default, the info window will pan the map so that it is fully
   * visible when it opens.
   */
  @Input() disableAutoPan: boolean;
  /**
   * All InfoWindows are displayed on the map in order of their zIndex, with higher values
   * displaying in front of InfoWindows with lower values. By default, InfoWindows are displayed
   * according to their latitude, with InfoWindows of lower latitudes appearing in front of
   * InfoWindows at higher latitudes. InfoWindows are always displayed in front of markers.
   */
  @Input() zIndex: number;
  /**
   * Maximum width of the infowindow, regardless of content's width. This value is only considered
   * if it is set before a call to open. To change the maximum width when changing content, call
   * close, update maxWidth, and then open.
   */
  @Input() maxWidth: number;
  /**
   * Holds the marker that is the host of the info window (if available)
   */
  hostMarker: KskMarker;
  /**
   * Holds the native element that is used for the info window content.
   */
  content: Node;
  /**
   * Sets the open state for the InfoWindow. You can also call the open() and close() methods.
   */
  @Input() isOpen: boolean = false;
  /**
   * Emits an event when the info window is closed.
   */
  @Output() infoWindowClose: EventEmitter<void> = new EventEmitter<void>();
  private _infoWindowAddedToManager: boolean = false;
  private _id: string = (infoWindowId++).toString();

  constructor(private _infoWindowManager: InfoWindowManager, private _el: ElementRef)
  {
  }

  ngOnInit()
  {
    this.content = this._el.nativeElement.querySelector('.ksk-info-window-content');
    this._infoWindowManager.addInfoWindow(this);
    this._infoWindowAddedToManager = true;
    this._updateOpenState();
    this._registerEventListeners();
  }

  /** @internal */
  ngOnChanges(changes: { [key: string]: SimpleChange })
  {
    if (!this._infoWindowAddedToManager)
    {
      return;
    }
    if ((changes['latitude'] || changes['longitude']) && typeof this.latitude === 'number' &&
      typeof this.longitude === 'number')
    {
      this._infoWindowManager.setPosition(this);
    }
    if (changes['zIndex'])
    {
      this._infoWindowManager.setZIndex(this);
    }
    if (changes['isOpen'])
    {
      this._updateOpenState();
    }
    this._setInfoWindowOptions(changes);
  }

  /**
   * Opens the info window.
   */
  open(): Promise<void>
  {
    return this._infoWindowManager.open(this);
  }

  /**
   * Closes the info window.
   */
  close(): Promise<void>
  {
    return this._infoWindowManager.close(this).then(() =>
    {
      this.infoWindowClose.emit();
    });
  }

  /** @internal */
  id(): string
  {
    return this._id;
  }

  /** @internal */
  toString(): string
  {
    return 'KskInfoWindow-' + this._id.toString();
  }

  /** @internal */
  ngOnDestroy()
  {
    this._infoWindowManager.deleteInfoWindow(this);
  }

  private _registerEventListeners()
  {
    this._infoWindowManager.createEventObservable('closeclick', this).subscribe(() =>
    {
      this.isOpen = false;
      this.infoWindowClose.emit();
    });
  }

  private _updateOpenState()
  {
    this.isOpen ? this.open() : this.close();
  }

  private _setInfoWindowOptions(changes: { [key: string]: SimpleChange })
  {
    let options: { [propName: string]: any } = {};
    let optionKeys = Object.keys(changes).filter(
      k => KskInfoWindow._infoWindowOptionsInputs.indexOf(k) !== -1);
    optionKeys.forEach((k) =>
    {
      options[k] = changes[k].currentValue;
    });
    this._infoWindowManager.setOptions(this, options);
  }
}
