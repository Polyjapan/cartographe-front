import { Component, OnInit } from '@angular/core';
import {MapsService} from "../../services/maps.service.";
import {Observable} from "rxjs";
import {MapDef} from "../../data/LayerDefs";
import {map, switchMap, tap} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-select-map',
  templateUrl: './select-map.component.html',
  styleUrls: ['./select-map.component.css']
})
export class SelectMapComponent implements OnInit {
  maps$: Observable<MapDef[]>;
  currentMap$: Observable<MapDef | null>

  constructor(private mapService: MapsService, private route: ActivatedRoute) {
    this.maps$ = mapService.listMaps().pipe(tap(onResult => {
      if (onResult.length !== 0 && this.mapService.mapId === 0) {
        // Set a default selected map
        this.mapService.mapId = onResult[0].mapId;
      }
    }))
    this.currentMap$ = this.maps$.pipe(switchMap(maps =>
      mapService.observableMapId.pipe(map(mapId => {
        const found = maps.find(m => m.mapId === mapId);
        return found ? found : null
      }))
    ))
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(map => {
      const setMapId = map.has('mapId') ? Number.parseInt(map.get('mapId')!!, 10) : null;
      if (setMapId) {
        this.mapService.mapId = setMapId;
      }
    })
  }

  switchTo(mapId: number) {
    this.mapService.mapId = mapId;
  }
}
