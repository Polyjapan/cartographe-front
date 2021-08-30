import {Component, Input, OnInit} from '@angular/core';
import LayerGroup from "ol/layer/Group";
import * as proj4x from "proj4";
import {Collection, Feature, Map, View} from "ol";
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

  selectionOverlay?: VectorLayer<VectorSource<any>>;

  jump: { layer: string | null, jump: string | null, dimension: string | null } = {
    layer: null,
    jump: null,
    dimension: null
  }
  selected: Feature<any>[] = [];
  private proj4 = (proj4x as any).default
  private olMap: Map = new Map({});

  constructor(private http: HttpClient, private route: ActivatedRoute, private maps: MapsService) {
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

  ngOnInit() {
    this.parseGetParameters();

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

    this.selectionOverlay = new VectorLayer<VectorSource<any>>({
      map: this.olMap,
      source: new VectorSource<any>({features: new Collection()}),
      style: new Style({stroke: new Stroke({color: 'red', width: 2})})
    });

    this.olMap.on('singleclick', evt => this.onClick(this.olMap, evt));

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
    return this.maps.getWMSLayers(this.dimension)
      .toPromise()
      .then(content => {
        return Promise.all(content.map(grp => {
          const layers = Promise.all(grp.layers.map(layerDef => {
            if (layerDef.kind.toLowerCase() === "wmts") {
              const parser = new WMTSCapabilities();
              const r: Promise<Tile<any>> = this.http.get(layerDef.url, {responseType: 'text'})
                .toPromise()
                .then(content => {
                  const options = optionsFromCapabilities(parser.read(content), layerDef.params);
                  for (let param in layerDef.params) {
                    if (layerDef.params.hasOwnProperty(param) && param.startsWith("dimension.")) {
                      options.dimensions[param.slice("dimension.".length)] = layerDef.params[param]
                    }
                  }

                  return new Tile({
                    source: new WMTS(options),
                    opacity: 1.0,
                    zIndex: layerDef.zIndex,
                    visible: layerDef.defaultVisibility,
                    properties: {
                      title: layerDef.title
                    },
                  });
                });

              return r;
            } else {
              return new Tile({
                source: new TileWMS({
                  url: layerDef.url,
                  params: layerDef.params,
                  attributions: 'EPFL/SwissTopo'
                }),
                opacity: 1.0,
                visible: layerDef.defaultVisibility,
                properties: {
                  title: layerDef.title
                },
                zIndex: layerDef.zIndex
              })
            }
          }));

          return layers.then(layers => {
            return new LayerGroup({
              layers: layers,
              properties: {
                title: grp.name
              }
            })
          })
        }))
      });
  }

  getGeoJsonLayers(): Promise<LayerGroup[]> {
    return this.maps.getJsonLayers(this.dimension)
      .toPromise()
      .then(content => {
        return content.map(grp => {
          const layers = grp.layers.map(layerDef => {
            const reader = new GeoJSON();
            const features = reader.readFeatures(layerDef)
            const source = new VectorSource({features: features, attributions: 'PolyJapan'});
            return new VectorLayer({
              source: source,
              declutter: true,
              style: layerDef.style ? getStyle(layerDef.style) : (x) => {
                return new Style({
                  stroke: new Stroke({
                    color: 'red',
                    width: 1,
                  }), fill: new Fill({color: 'rgba(55,55,55,1.0)'})
                })
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
      })
  }

  unselectAll() {
    this.sidebar!.clear();
    this.selected.forEach(e => this.selectionOverlay?.getSource()?.removeFeature(e));
    this.selected = [];
  }

  private select(entities: [Feature<any>, Layer<any>][]) {
    console.log("selecting")
    console.log(entities)

    const features: [any, Layer<any>][] = [];

    entities.forEach(tuple => {
      console.log(tuple)
      const entity = tuple[0]
      const layer = tuple[1]
      if (this.selected.indexOf(entity) === -1) {
        this.selected.push(entity);
        this.selectionOverlay?.getSource()?.addFeature(entity)
      }

      const attributes: [string, string][] = []

      for (let k of (entity as any).getKeys()) {
        if (k === 'geometry' || !entity.get(k) || entity.get(k) === "null") continue;

        attributes.push([k, entity.get(k)])
      }

      const element: [any, Layer<any>] = [attributes, layer]
      features.push(element);
    })

    if (features.length > 0) {
      this.sidebar?.setFeatures(this.dimension, features)
    }
  }

  private onClick(map: Map, event: any) {
    this.unselectAll()

    const pixel = map.getEventPixel(event.originalEvent)
    const features: [Feature<any>, Layer<any>][] = [];
    map.forEachFeatureAtPixel(pixel, (feature, layer) => {
      features.push([feature as Feature<any>, layer])
    })

    if (features.length > 0) {
      this.select(features)
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
        this.olMap.getView().setZoom(21);
        this.select([[feature, layer as Layer<any>]]);
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
