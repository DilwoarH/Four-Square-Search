import { Component, OnInit } from '@angular/core';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent extends MapComponent implements OnInit {

  ngOnInit() {
    this.searchComplete();
  }

}
