import {Component, OnInit} from '@angular/core';
import LayerGroup from "ol/layer/Group";
import * as proj4x from "proj4";
import {Map, View} from "ol";
import {HttpClient} from "@angular/common/http";
import {get} from "ol/proj";
import {defaults as defaultControls} from "ol/control";
import {getCenter} from "ol/extent";
import {FloorChangerControl} from "../../controls/FloorChangerControl";
import {register} from "ol/proj/proj4";
import {map} from "rxjs/operators";
import {WMTSCapabilities} from "ol/format";
import {optionsFromCapabilities} from "ol/source/WMTS";
import {Layer, Tile} from "ol/layer";
import {WMTS} from "ol/source";
import {ActivatedRoute} from "@angular/router";
import BaseLayer from "ol/layer/Base";
import {MapsService} from "../../services/maps.service.";
import {defaults as defaultInteractions, Modify, Select,} from 'ol/interaction';
import {LayersService} from "../../services/layers.service";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  dimension = "1"
  currentFloor: LayerGroup[] = []

  jump: { layer: string | null, jump: string | null, dimension: string | null } = {
    layer: null,
    jump: null,
    dimension: null
  }
  selectInteraction: Select = new Select();
  private proj4 = (proj4x as any).default
  olMap: Map = new Map({});

  constructor(private http: HttpClient, private route: ActivatedRoute, private maps: MapsService, private layers: LayersService) {
  }

  changeFloor(dim: string) {
    this.currentFloor.forEach(e => this.olMap.removeLayer(e));
    this.dimension = dim;
    this.loadFloor()
  }

  loadFloor() {
    console.log("Load floor called")

    if (this.maps.mapId === 0)
      return;

    this.getWMSLayers().then(grps => {
      grps.forEach(grp => {
        this.olMap.addLayer(grp);
        this.currentFloor.push(grp);
      })
    })
      .then(() => this.getGeoJsonLayers())
      .then(grps => {
        grps.forEach(grp => {
          console.log("Adding layer " + grp.getProperties()['title'])
          this.olMap.addLayer(grp);
          this.currentFloor.push(grp);
        })
      })
      .then(() => this.doJump());

  }

  ngOnInit() {
    this.parseGetParameters();

    // const modify = new Modify({features: this.selectInteraction.getFeatures()/*, insertVertexCondition: () => false*/})

    this.registerEPSG2056()
    this.olMap = new Map({
      view: new View({
        center: [2533150, 1152450],
        projection: get('EPSG:2056'),
        zoom: 18,
        extent: [2532000.218049, 1150000.460788, 2534500.382181, 1155000.699121]
      }),
      layers: [],
      target: 'map',
      controls: defaultControls().extend([new FloorChangerControl(this, {})]),
      interactions: defaultInteractions().extend([this.selectInteraction/*, modify*/]),
    });

    this.createBackgroundLayer().toPromise().then(lyr => {
      this.olMap.getLayers().insertAt(0, lyr);
      lyr.setVisible(true);
    })

    this.maps.observableMapId.subscribe(change => {
      console.log("mapId change " + change)
      this.currentFloor.forEach(e => this.olMap.removeLayer(e));
      this.loadFloor();
    });

    // This load floor is not necessary, since the mapId will be automatically set
    // this.loadFloor();
  }

  registerEPSG2056() {
    this.proj4.defs("EPSG:2056", "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs");
    register(this.proj4);
  }

  createBackgroundLayer() {
    return this.http.get('https://plan-epfl-wmts0.epfl.ch/1.0.0/WMTSCapabilities_2056.xml', {responseType: 'text'})
      .pipe(map(content => {
        const parser = new WMTSCapabilities();

        const options = optionsFromCapabilities(parser.read(content), {
          layer: 'osm-wmts',
          matrixSet: '2056'
        });

        return new Tile({
          source: new WMTS(options),
          opacity: 1.0,
          zIndex: -1000
        });
      }));
  }

  getWMSLayers(): Promise<LayerGroup[]> {
    return this.layers.getWMSLayers(this.dimension);
  }

  getGeoJsonLayers(): Promise<LayerGroup[]> {
    return this.layers.getGeoJsonLayers(this.dimension)
  }

  private parseGetParameters() {
    // Don't need to keep an observable on the route, we only want to take this into account on first load
    const map = this.route.snapshot.queryParamMap

    const floor = map.get('floor')
    if (floor) {
      this.dimension = floor;
    }

    const jumpTo = map.get('jump');

    if (jumpTo) {
      const parts = jumpTo?.split(';')!!
      this.jump.layer = parts[0]
      this.jump.jump = parts[1]
    }
  }

  private recursiveJump(layer: BaseLayer) {
    if ((layer as any).getLayers) {
      (layer as LayerGroup).getLayers().forEach(layer => this.recursiveJump(layer))
    } else {
      if (layer.getProperties().tableName && layer.getProperties().tableName === this.jump.layer) {
        const feature = (layer as Layer<any>).getSource().getFeatureById(this.jump.jump);
        const center = getCenter(feature.getGeometry().getExtent())
        this.olMap.getView().setCenter(center);
        this.olMap.getView().setZoom(22);


        this.selectInteraction?.getFeatures().push(feature)
      }
    }
  }

  private doJump() {
    if (this.jump.jump) {
      // this is not great if we have lots of layers...
      this.olMap.getLayers().forEach(layer => this.recursiveJump(layer))
    }
  }
}
