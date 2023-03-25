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

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})
export class AlbumComponent implements OnInit {
  id: string = "";
  album: any;
  // pbUrl!: SafeResourceUrl;

  constructor(private route: ActivatedRoute,
              private spotify: SpotifyService, // <-- injected
              private location: Location
              // ,private sanitizer: DomSanitizer
  ) {
    route.params.subscribe(params => { this.id = params['id']; });
  }

  ngOnInit(): void {
    this.spotify
      .getAlbum(this.id)
      .subscribe((res: any) => this.renderAlbum(res));
  }

  back(): void {
    this.location.back();
  }

  renderAlbum(res: any): void {
    this.album = res;

    // const url = `https://open.spotify.com/embed/album/${res.id}`;
    // this.pbUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
