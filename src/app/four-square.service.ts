import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class FourSquareService {

  private CLIENT_ID: string = 'O2V1OIPD4DSCHKHVZMBDW042BAA3MJVCR4UCWKI54BX3VAIW';
  private CLIENT_SECRET: string = '1KNWDHH2DJ5I0NOCUYJ12EDGI5E1JDGQRQMUJJQGIFAKQBGY';

  private FOUR_SQUARE_API: string = 'https://api.foursquare.com/v2/';
  private VENUE_ENDPOINT: string = 'venues/explore?locale=en&radius=1000&ll=';

  constructor(
    private http: Http
  ) { }

  getVenues(lat, lng, search){

    var url = this.FOUR_SQUARE_API + this.VENUE_ENDPOINT + lat +","+ lng + "&client_id=" + this.CLIENT_ID + "&client_secret=" + this.CLIENT_SECRET + "&v=20170325&near=" + search;

    return this.http.get(url)
    .map((res:Response) => res.json());

  }

}

