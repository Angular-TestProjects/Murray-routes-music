import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {catchError, map, Observable, of, switchMap, tap, throwError} from "rxjs";
import {environment} from "../environments/environment";
import {routes} from "./app-routing-paths";

/**
 * SpotifyService works querying the Spotify Web API
 * https://developer.spotify.com/web-api/
 */

@Injectable()
export class SpotifyService {
  static BASE_URL = "https://api.spotify.com/v1";
  static AUTH_URL = "https://accounts.spotify.com/authorize";
  static TOKEN_URL = "https://accounts.spotify.com/api/token";

  constructor(private http: HttpClient) {}

  query(URL: string, params?: Array<string>, forcibly?: boolean): Observable<any> {
    return this.getToken(forcibly).pipe(
      switchMap(token => {
        let queryURL = `${SpotifyService.BASE_URL}${URL}`;
        if (params) {
          queryURL = `${queryURL}?${params.join("&")}`;
        }

        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
        const options = {
          headers: headers
        };

        return this.http.request("GET", queryURL, options).pipe(
          catchError(err => {
            if(err.status != 401)
              return throwError(() => throwError(err));

            return this.query(URL, params, true);
          })
        );
      })
    );
  }

  getToken(forcibly?: boolean): Observable<string> {
    const token = localStorage.getItem('spotify_access_token');
    if (token && !forcibly) {
      return of(token);
    }

    return this.getAuthCode().pipe(
      map((auth_data) => auth_data)
      , catchError(err => throwError(err))
      , switchMap(({auth_code, auth_code_uri}) => {
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };

        const body = `grant_type=authorization_code`
              + `&code=${auth_code}`
              + `&redirect_uri=${auth_code_uri}`
              + `&client_id=${environment.spotifyClientId}`
              + `&client_secret=${environment.spotifyClientSecret}`;

        return this.http
          .post<{ access_token: string }>(SpotifyService.TOKEN_URL, body, {headers})
          .pipe(
            map(({access_token}) => access_token)
            , catchError((err: HttpErrorResponse) => {
              if(err.status != 400) {
                return throwError(() => err);
              }

              localStorage.removeItem('spotify_access_token');
              return this.getAuthCode(true).pipe(
                catchError(errA => throwError(errA))
                ,switchMap(() => "")
              );
            })
            , tap((access_token) => {localStorage.setItem('spotify_access_token', access_token);
            })
          );
      })
    );
  }

  getAuthCode(forcibly?: boolean): Observable<{ auth_code: string, auth_code_uri: string }> {
    const auth_code = localStorage.getItem('spotify_auth_code');
    const auth_code_uri = localStorage.getItem('spotify_auth_code_uri');

    if (auth_code && auth_code_uri && !forcibly) {
      return of({
        auth_code: auth_code
        , auth_code_uri: auth_code_uri
      });
    }

    localStorage.removeItem('spotify_auth_code');
    localStorage.removeItem('spotify_auth_code_uri');
    const baseUrl = encodeURIComponent(window.location.origin + '/' + routes.search);
    window.location.href = `${SpotifyService.AUTH_URL}?`
          + `client_id=${environment.spotifyClientId}`
          + `&response_type=code&redirect_uri=${baseUrl}`
          + `&scope=user-read-private%20user-read-email`;

    return throwError(() => new Error("Auth code hasn't set yet or forcibly has been changed."));
  }

  setAuthCode(new_code: string, uri: string){
    const auth_code = localStorage.getItem('spotify_auth_code') || "";
    if (!new_code || !uri || new_code === auth_code)
      return;

    localStorage.setItem('spotify_auth_code', new_code);
    localStorage.setItem('spotify_auth_code_uri', uri);
    this.getToken(true).subscribe(code => console.trace(`New token was set ${code}`));
  }

  search(query: string, type: string): Observable<any> {
    return this.query(`/search`, [`q=${query}`, `type=${type}`]);
  }

  searchTrack(query: string): Observable<any> {
    return this.search(query, "track");
  }

  getTrack(id: string): Observable<any> {
    return this.query(`/tracks/${id}`);
  }

  getArtist(id: string): Observable<any> {
    return this.query(`/artists/${id}`);
  }

  getAlbum(id: string): Observable<any> {
    return this.query(`/albums/${id}`);
  }
}

export const SPOTIFY_PROVIDERS: Array<any> = [
  { provide: SpotifyService, useClass: SpotifyService }
];
