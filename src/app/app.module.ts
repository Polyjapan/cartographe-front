import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapComponent } from './components/map/map.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import { InfoboxComponent } from './components/infobox/infobox.component';
import {MatListModule} from "@angular/material/list";
import { AppRoutingModule } from './app-routing.module';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {JwtModule} from "@auth0/angular-jwt";
import {environment} from "../environments/environment";
import { LoginCallbackComponent } from './components/account/login-callback/login-callback.component';
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatCardModule} from "@angular/material/card";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatButtonModule} from "@angular/material/button";
import { RequireLoginComponent } from './components/account/require-login/require-login.component';
import {LoginService} from "./services/login.service";
import {AuthService} from "./services/auth.service";
import { SelectMapComponent } from './components/select-map/select-map.component';
import {MapsService} from "./services/maps.service.";
import {MatMenuModule} from "@angular/material/menu";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {LayersService} from "./services/layers.service";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import { LayerSelectorComponent } from './components/layer-selector/layer-selector.component';
import { LayerRowComponent } from './components/layer-selector/layer-row/layer-row.component';
import {MatExpansionModule, MatExpansionPanel} from "@angular/material/expansion";
import { ModifyAttributesComponent } from './components/modify-attributes/modify-attributes.component';

export function tokenGetter() {
  return localStorage.getItem('id_token');
}

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    InfoboxComponent,
    LoginCallbackComponent,
    RequireLoginComponent,
    SelectMapComponent,
    LayerSelectorComponent,
    LayerRowComponent,
    ModifyAttributesComponent
  ],
    imports: [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatSidenavModule,
        MatListModule,
        AppRoutingModule,
        AppRoutingModule,
      MatToolbarModule,
      MatIconModule,
      FlexLayoutModule,
      MatCardModule,
      MatProgressBarModule,
      MatButtonModule,
      MatMenuModule,
      MatProgressSpinnerModule,
      MatSnackBarModule,
      MatSlideToggleModule,
      MatExpansionModule,

      JwtModule.forRoot({
        config: {
          tokenGetter,
          allowedDomains: [environment.apidomain]
        }
      }),
    ],
  providers: [LoginService, AuthService, MapsService, LayersService],
  bootstrap: [AppComponent]
})
export class AppModule { }
