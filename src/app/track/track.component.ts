/*
 * Angular
 */

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

/*
 * Services
 */
import {SpotifyService} from '../spotify.service';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnInit {
  id: string = "";
  track: any;
  pbUrl!: SafeResourceUrl;

  constructor(private route: ActivatedRoute, private spotify: SpotifyService,
              private location: Location,
              private sanitizer: DomSanitizer) {
    route.params.subscribe(params => { this.id = params['id']; });
  }

  ngOnInit(): void {
    this.spotify
      .getTrack(this.id)
      .subscribe((res: any) => this.renderTrack(res));
  }

  back(): void {
    this.location.back();
  }

  renderTrack(res: any): void {
    debugger;
    this.track = res;

    const url = `https://open.spotify.com/embed/track/${res.id}?utm_source=generator`;
    this.pbUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
