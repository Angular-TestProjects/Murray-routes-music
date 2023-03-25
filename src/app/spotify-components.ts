import {SpotifyService} from "./spotify.service";
import {ActivatedRoute} from "@angular/router";
import {filter, map} from "rxjs";

export class SpotifyComponents {

  constructor(protected spotify: SpotifyService,
              protected route: ActivatedRoute) {
    this.route
      .queryParams
      .pipe(
        map(params => params['code']) // extract the value of the 'code' parameter
        ,filter(code => !!code) // only send if code exists
      )
      .subscribe(code => {spotify.setAuthCode(code, window.location.origin + "/" + route.snapshot.url.join('/'))});
  }
}
