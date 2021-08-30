import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {LoginService} from "../../../services/login.service";
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'app-login-callback',
  templateUrl: './login-callback.component.html',
  styleUrls: ['./login-callback.component.css']
})
export class LoginCallbackComponent implements OnInit {
  done: boolean = false;
  success: boolean = true;

  constructor(private activatedRoute: ActivatedRoute, private loginService: LoginService, private authService: AuthService, private route: Router) {
  }

  ngOnInit(): void {
    const params = this.activatedRoute.snapshot.queryParamMap
    console.log(params)
    if (params.has('ticket')) {
      this.loginService
        .login(params.get('ticket')!!)
        .toPromise()
        .then(success => {
          console.log(success)
          const redirect = this.authService.login(success.session);
          this.done = true;
          this.route.navigateByUrl(redirect);
        })
        .catch(err => {
          console.log(err)
          this.success = false;
          this.done = true;
        })
        .finally(() => console.log("finally"));
    } else {
      this.success = false;
      this.done = true;
    }


  }

}
