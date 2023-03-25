import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SearchComponent} from "./search/search.component";
import {ArtistComponent} from "./artist/artist.component";
import {TrackComponent} from "./track/track.component";
import {AlbumComponent} from "./album/album.component";
import {routes as route_path} from "./app-routing-paths";


const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: route_path.search, component: SearchComponent },
  { path: route_path.artists, component: ArtistComponent },
  { path: route_path.tracks, component: TrackComponent },
  { path: route_path.albums, component: AlbumComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
