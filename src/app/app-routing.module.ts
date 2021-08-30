import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {MainComponent} from "./components/main/main.component";
import {RequireLoginComponent} from "./components/account/require-login/require-login.component";
import {LoginCallbackComponent} from "./components/account/login-callback/login-callback.component";

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'require-login', component: RequireLoginComponent },
  { path: 'login-callback', component: LoginCallbackComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
