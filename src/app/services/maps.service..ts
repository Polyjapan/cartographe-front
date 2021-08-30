import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {GeoJsonLayer, LayerGroupDef, MapDef, WMSLayerDef} from "../data/LayerDefs";

@Injectable()
export class MapsService {
  private baseUrl = environment.backend;
  private _mapId: number = 0;
  private _observableMapId: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
  }

  listMaps(): Observable<MapDef[]> {
    return this.http.get<MapDef[]>(this.baseUrl + '/maps')
  }

  getWMSLayers(dimension: string) {
    return this.http.get<LayerGroupDef<WMSLayerDef>[]>(environment.backend + "/wms/" + this._mapId + "/" + dimension)
  }

  getJsonLayers(dimension: string) {
    return this.http.get<LayerGroupDef<GeoJsonLayer>[]>(environment.backend + "/json/" + this._mapId + "/" + dimension)
  }

  get observableMapId(): Observable<number> {
    return this._observableMapId;
  }

  set mapId(id: number) {
    this._mapId = id;
    this._observableMapId.next(id);
  }

  get mapId() {
    return this._mapId
  }

}
