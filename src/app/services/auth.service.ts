import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router, UrlTree} from '@angular/router';
import {environment} from '../../environments/environment';
import {UserSession} from "../data/UserSession";

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private jwtHelper: JwtHelperService, private route: Router) {
  }

  login(token: string): UrlTree {
    localStorage.setItem('id_token', token);

    const d = new Date();
    d.setTime(d.getTime() + (2 * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = "session=" + token + ";" + expires + ";path=/";

    let act = this.loadNextAction();

    if (!act || act.startsWith('/?ticket=')) {
      act = '/';
    }

    return this.route.createUrlTree([act]);
  }

  public changeToken(token: string) {
    localStorage.setItem('id_token', token);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('id_token');

    window.location.replace(environment.auth.apiurl + '/logout?app=' + environment.apidomain);
  }

  private loadNextAction(): string | null {
    const act = localStorage.getItem('_post_login_action');
    localStorage.removeItem('_post_login_action');

    return act;
  }

  private storeNextAction(action: string) {
    localStorage.setItem('_post_login_action', action);
  }

  public getToken(): UserSession | null {
    const token = localStorage.getItem('id_token');
    const decoded = token ? this.jwtHelper.decodeToken(token) : undefined;

    if (decoded && decoded.user) {
      return decoded.user as UserSession;
    } else {
      return null;
    }
  }

  public hasGroup(group: string): boolean {
    const token = this.getToken();
    if (this.isAuthenticated() && token) {
      return token.groups.indexOf(group) !== -1;
    } else {
      return false;
    }
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('id_token');

    if (token === null) {
      return false;
    }

    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
