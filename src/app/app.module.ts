import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapComponent } from './components/map/map.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import { SidebarComponent } from './components/sidebar/sidebar.component';
import {MatListModule} from "@angular/material/list";
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './components/main/main.component';
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

export function tokenGetter() {
  return localStorage.getItem('id_token');
}

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SidebarComponent,
    MainComponent,
    LoginCallbackComponent,
    RequireLoginComponent,
    SelectMapComponent
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

      JwtModule.forRoot({
        config: {
          tokenGetter,
          allowedDomains: [environment.apidomain]
        }
      }),
    ],
  providers: [LoginService, AuthService, MapsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
