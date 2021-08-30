import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import LayerGroup from "ol/layer/Group";
import * as proj4x from "proj4";
import {Map, Overlay, View} from "ol";
import {HttpClient} from "@angular/common/http";
import {get} from "ol/proj";
import {defaults as defaultControls} from "ol/control";
import {getCenter} from "ol/extent";
import {FloorChangerControl} from "../../controls/FloorChangerControl";
import {register} from "ol/proj/proj4";
import {map} from "rxjs/operators";
import {GeoJSON, WMTSCapabilities} from "ol/format";
import {optionsFromCapabilities} from "ol/source/WMTS";
import {Layer, Tile} from "ol/layer";
import {TileWMS, WMTS} from "ol/source";
import {Observable} from "rxjs";
import {GeoJsonLayer, LayerGroupDef, WMSLayerDef} from "../../data/LayerDefs";
import {environment} from "../../../environments/environment";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Fill, Stroke, Style} from "ol/style";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {getStyle} from "../../styles/Style";
import {ActivatedRoute} from "@angular/router";
import BaseLayer from "ol/layer/Base";
import {MapsService} from "../../services/maps.service.";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() sidebar?: SidebarComponent;

  title = 'cartographe-front';
  dimension = "1"

  currentFloor: LayerGroup[] = []

  jump: {layer: string|null, jump: string|null, dimension: string|null} = { layer: null, jump: null, dimension: null }

  private proj4 = (proj4x as any).default
  private olMap: Map = new Map({});

  constructor(private http: HttpClient, private route: ActivatedRoute, private maps: MapsService) {
  }

  private onClick(map: Map, event: any) {
    this.closePopup()

    const pixel = map.getEventPixel(event.originalEvent)
    const features: [any, Layer<any>][] = [];
    map.forEachFeatureAtPixel(pixel, (feature, layer) => {

      const attributes: [string, string][] = []

      for (let k of (feature as any).getKeys()) {
        if (k === 'geometry' || !feature.get(k) || feature.get(k) === "null") continue;

        attributes.push([k, feature.get(k)])

      }

      const element: [any, Layer<any>] = [attributes, layer]
      features.push(element)
    })

    if (features.length > 0) {
      this.sidebar?.setFeatures(this.dimension, features)
    }
  }

  changeFloor(dim: string) {
    this.currentFloor.forEach(e => this.olMap.removeLayer(e));
    this.dimension = dim;
    this.loadFloor()
  }

  loadFloor() {
    if (this.maps.mapId === 0)
      return;

    this.getWMSLayers().toPromise().then(grps => {
      grps.forEach(grp => {
        this.olMap.addLayer(grp);
        this.currentFloor.push(grp);
      })
    })
    this.getGeoJsonLayers().toPromise().then(grps => {
      grps.forEach(grp => {
        this.olMap.addLayer(grp);
        this.currentFloor.push(grp);
      });
      this.doJump();
    })
  }

  private recursiveJump(layer: BaseLayer) {
    if ((layer as any).getLayers) {
      (layer as LayerGroup).getLayers().forEach(layer => this.recursiveJump(layer))
    } else {
      if (layer.getProperties().tableName && layer.getProperties().tableName === this.jump.layer) {
        console.log((layer as Layer<any>).getSource().getFeatureByUid(20))
        const feature = (layer as Layer<any>).getSource().getFeatureById(this.jump.jump);
        const center = getCenter(feature.getGeometry().getExtent())
        this.olMap.getView().setCenter(center);
        this.olMap.getView().setZoom(21);
        // this.olMap.getView().fit(feature.getGeometry().getExtent())
      }
    }
  }

  private doJump() {
    if (this.jump.jump) {
      // this is not great if we have lots of layers...
      this.olMap.getLayers().forEach(layer => this.recursiveJump(layer))
    }
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(map => {
      const floor = map.get('floor')
      if (floor) {
        this.changeFloor(floor);
      }

      const jumpTo = map.get('jump');

      if (jumpTo) {
        const parts = jumpTo?.split(';')!!
        this.jump.layer = parts[0]
        this.jump.jump = parts[1]
        console.log(this.jump)
      } else {
        this.jump.layer = null;
        this.jump.jump = null;
      }


    })

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
      controls: defaultControls().extend([new FloorChangerControl(this, {})])
    });

    this.olMap.on('singleclick', evt => this.onClick(this.olMap, evt));

    this.createBackgroundLayer().subscribe(lyr => {
      this.olMap.getLayers().insertAt(0, lyr);
      lyr.setVisible(true);
    })

    this.maps.observableMapId.subscribe(change => {
      this.currentFloor.forEach(e => this.olMap.removeLayer(e));
      this.loadFloor();
    });

    this.loadFloor();
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
          opacity: 1.0
        });
      }));
  }

  getWMSLayers(): Observable<LayerGroup[]> {
    return this.maps.getWMSLayers(this.dimension)
      .pipe(map(content => {

        return content.map(grp => {
          const layers = grp.layers.map(layerDef => {
            return new Tile({
              source: new TileWMS({
                url: layerDef.url,
                params: layerDef.params
              }),
              opacity: 1.0,
              visible: layerDef.defaultVisibility,
              properties: {
                title: layerDef.title
              }
            })
          });

          return new LayerGroup({
            layers: layers,
            properties: {
              title: grp.name
            }
          })
        })
      }))
  }

  getGeoJsonLayers(): Observable<LayerGroup[]> {
    return this.maps.getJsonLayers(this.dimension)
      .pipe(map(content => {

        return content.map(grp => {
          const layers = grp.layers.map(layerDef => {
            const reader = new GeoJSON();
            const features = reader.readFeatures(layerDef)
            const source = new VectorSource({features: features, attributions: 'PolyJapan'});
            return new VectorLayer({
              source: source,
              declutter: true,
              style: layerDef.style ? getStyle(layerDef.style) : (x) => {
                return new Style({stroke: new Stroke({
                    color: 'red',
                    width: 1,
                  }), fill: new Fill({color: 'rgba(55,55,55,1.0)'})})
              },
              properties: {
                title: layerDef.title,
                tableName: layerDef.tableName
              },
              opacity: 0.8
              //interactive: true,
              //title: layerDef.name
            });
          });

          return new LayerGroup({
            layers: layers,
            properties: {
              title: grp.name
            }
          })
        })
      }))
  }

  closePopup() {
    this.sidebar!.clear();
  }
}
