import { Component, OnInit } from '@angular/core';
import { FourSquareService } from '../four-square.service';

declare var L: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [ FourSquareService ]
})
export class MapComponent implements OnInit {

  constructor(
        public fourSquareService: FourSquareService 
  ) { }

  public map = null;
  
  private userLocationInfo = {
    userMarker: null,
    userCircle: null,
    userLat: null,
    userLng: null
  };

  public Venues: FourSquareService[];
  
  private markers = [];

  ngOnInit() {
    this.initMap();
  }

  initMap() {

    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    /*L.marker([51.5, -0.09]).addTo(this.map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();*/
    
  }

  findMeBtnClicked() {
    var _this = this;
  
    this.map.locate({setView: true, watch: false}) /* This will return map so you can do chaining */
        .on('locationfound', function(e){

            if ( _this.userLocationInfo.userMarker )
            {
              _this.map.removeLayer( _this.userLocationInfo.userMarker );
            }

            if ( _this.userLocationInfo.userCircle )
            {
              _this.map.removeLayer( _this.userLocationInfo.userCircle );
            }

            //save user location
            _this.userLocationInfo.userLat = e.latitude;
            _this.userLocationInfo.userLng = e.longitude;
            
            _this.userLocationInfo.userMarker = L.marker(
              [e.latitude, e.longitude]
            ).bindPopup('Your are here :)');

            _this.userLocationInfo.userCircle = L.circle([e.latitude, e.longitude], e.accuracy/2, {
                weight: 1,
                color: 'blue',
                fillColor: '#cacaca',
                fillOpacity: 0.2
            });

            _this.map.addLayer(_this.userLocationInfo.userMarker);
            _this.map.addLayer(_this.userLocationInfo.userCircle);
        })
       .on('locationerror', function(e){
            console.log(e);
            console.info("Location access denied.");
        });
  }

  search() {
    this.fourSquareService
      .getVenues(51.505, -0.09)
      .subscribe(
        response => {
          this.searchComplete( response );
        }
      );    
  }

  searchComplete( response ) {
    this.Venues = response;
    console.log(this.Venues);
    //https://ss3.4sqi.net/img/categories_v2/parks_outdoors/plaza_bg_44.png
    this.processData( response.response.venues );
  }

  processData( venues ) {
    venues.forEach(venue => {
      this.addMarker(venue);
    });
  }

  addMarker( point ) {
    console.log( point );
    var marker = L.marker(
      [point.location.lat, point.location.lng]
    ).bindPopup('PUT TEXT HERE');

    console.log( marker );
    console.log(this.map);
    debugger;

    this.map.addLayer( marker );
  }

}
