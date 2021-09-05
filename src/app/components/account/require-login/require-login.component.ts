import { Component, OnInit } from '@angular/core';
import {environment} from "../../../../environments/environment";
import {Router} from "@angular/router";

@Component({
  selector: 'app-require-login',
  templateUrl: './require-login.component.html',
  styleUrls: ['./require-login.component.css']
})
export class RequireLoginComponent implements OnInit {
  private service = window.location.origin;

  url: string = environment.auth.apiurl + '/cas/login?service=' + this.service + '/login-callback';

  constructor(private router: Router) { }

  ngOnInit() {
    window.location.replace(this.url);
  }
}
