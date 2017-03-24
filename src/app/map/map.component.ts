import { Component, OnInit } from '@angular/core';
import { FourSquareService } from '../four-square.service';

declare var L: any;
declare var document: any;

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
  private defaultSettings = {
    lat: "51.505",
    lng: "-0.09",
    initZoom: 10,
    zoom: 14,
    maxZoom: 19
  };

  ngOnInit() {
    this.initMap();
  }

  initMap() {

    this.map = L.map('map').setView([this.defaultSettings.lat, this.defaultSettings.lng], this.defaultSettings.initZoom);

    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: this.defaultSettings.maxZoom
    }).addTo(this.map);

    this.search();
    
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
            _this.map.setZoom( _this.defaultSettings.zoom );

            _this.search( _this.userLocationInfo.userLat, _this.userLocationInfo.userLng );
        })
       .on('locationerror', function(e){
            console.log(e);
            _this.updateResultHeadline("Location access denied.");
        });
  }

  searchBtnClicked()
  {
    var searchText = document.getElementById('search').value;
    this.search(this.defaultSettings.lat,this.defaultSettings.lng,searchText);
  }

  search( lat = this.defaultSettings.lat, lng = this.defaultSettings.lng, search = "" ) {
    

    this.fourSquareService
    .getVenues(lat, lng, search)
    .subscribe(
      response => {
        this.searchComplete( response, lat, lng );
      },
      error => {
        this.updateResultHeadline( 'Location not found :(' );
      }
    );
    
  }

  searchComplete( response, lat, lng ) {
    this.updateResultHeadline( response.response.headerFullLocation );
    this.processData( response.response.groups[0].items );
    var center_lat =  ( response.response.geocode ? response.response.geocode.center.lat : lat);
    var center_lng =  ( response.response.geocode ? response.response.geocode.center.lng : lng);
    this.map.setView( [ center_lat , center_lng ], this.defaultSettings.zoom );
  }

  updateResultHeadline( headline )
  {
    document.getElementById('headline').innerText = headline;
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

    var popupMessage = 
      `
      <div class="popupMessage">
        <h5>
          <img 
            src="${point.categories[0].icon.prefix}bg_44${point.categories[0].icon.suffix}" 
            style="float: left; margin: 5px;"
          />
          ${ point.name }
          <div class="venue_rating" style="
          background-color: #${point.ratingColor};
          height: 40px;
          width: 40px;
          font-size: 20px;
          color: white;
          padding: 7px;
          text-align: center;
          float: right;
          margin: 10px;
        ">
          ${point.rating || "No Ratings Yet."}
        </div> 
        </h5>
        <strong>
          ${point.categories[0].name}
        </strong>
        <hr/>
        <Address>
          <strong>Address:</strong>
          ${point.location.formattedAddress.join(', ')}
        </Address>
        <hr/>
        <summary>
          <strong>Here Now: ${point.hereNow.summary}</strong>
        </summary>

        
      </div>
      `


    var marker = L.marker(
      [point.location.lat, point.location.lng],
      options
    ).bindPopup(
      popupMessage
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
