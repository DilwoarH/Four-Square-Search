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

  //map variables
  public map = null;
  public cluster;
  private userLocationInfo = {
    userMarker: null,
    userCircle: null,
    userLat: null,
    userLng: null
  };

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
            ).bindPopup('You are here :)');

            _this.userLocationInfo.userCircle = L.circle([e.latitude, e.longitude], e.accuracy/2, {
                weight: 1,
                color: 'blue',
                fillColor: '#cacaca',
                fillOpacity: 0.2
            });

            _this.map.addLayer(_this.userLocationInfo.userMarker);
            _this.map.addLayer(_this.userLocationInfo.userCircle);
            _this.map.setZoom( 15 );

            _this.search( _this.userLocationInfo.userLat, _this.userLocationInfo.userLng );
        })
       .on('locationerror', function(e){
            console.log(e);
            console.info("Location access denied.");
        });
  }

  search( lat = "51.505", lng = "-0.09", search = "" ) {
    this.fourSquareService
      .getVenues(lat, lng, search)
      .subscribe(
        response => {
          this.searchComplete( response, lat, lng );
        }
      );
  }

  searchComplete( response, lat, lng ) {
    this.processData( response.response.groups[0].items );
    var center_lat =  ( response.response.geocode ? response.response.geocode.center.lat : lat);
    var center_lng =  ( response.response.geocode ? response.response.geocode.center.lng : lng);
    this.map.setView( [ center_lat , center_lng ], 16 );
  }

  processData( venues ) {
    
    //Clean up old markers
    if ( this.cluster )
      this.removeMarker( this.cluster );

    //init cluster
    this.cluster = L.markerClusterGroup();

    //add in new markers
    venues.forEach(venue => {
      this.addMarker(venue.venue);
    });

    this.map.addLayer( this.cluster );

  }

  addMarker( point ) {
    var marker = this.makeMarker( point );
    this.cluster.addLayer( marker );
  }

  removeMarker( marker ) {
    this.map.removeLayer( marker );
  }

  makeMarker( point ) {
    let options = {
      icon: this.makeIcon( point )
    };
    
    if ( options.icon === null)
    {
      delete(options.icon);
    }
    var marker = L.marker(
      [point.location.lat, point.location.lng],
      options
    ).bindPopup(
      `
      <div>
        <h3>
          ${ point.name }
        </h3>
        <img src="${point.categories[0].icon.prefix}bg_44${point.categories[0].icon.suffix}" />
      </div>
      `
    );

    return marker;
  } 

  makeIcon( point ) {
    if ( !point.categories.length )
    {
      return null;
    }

    var myIcon = L.icon({
        iconUrl: point.categories[0].icon.prefix + "bg_44" + point.categories[0].icon.suffix,
        iconSize: [44, 44],
        shadowSize: [68, 95],
        shadowAnchor: [22, 94]
    });
    

    return myIcon;
  }
}
