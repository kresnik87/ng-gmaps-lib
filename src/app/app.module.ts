import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {GmapsLibModule} from "@ksk/ng-gmaps-lib";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {GmapsLibModule} from '../../projects/ng-gmaps/src/lib/gmaps-lib.module';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    GmapsLibModule.forRoot({
      apiKey: '',
      libraries: ['places']
    }),
    AppRoutingModule,
    BrowserAnimationsModule,
    GmapsLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
