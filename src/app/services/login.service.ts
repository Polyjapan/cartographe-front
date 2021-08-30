import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";

@Injectable()
export class LoginService {
  private loginUrl = environment.backend + '/login';

  constructor(private http: HttpClient) {
  }

  login(ticket: string): Observable<LoginResponse> {
    return this.http
      .get<LoginResponse>(this.loginUrl + '/' + ticket);
  }
}

export interface LoginResponse {
  session: string;
}
