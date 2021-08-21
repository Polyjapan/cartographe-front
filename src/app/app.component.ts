import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {optionsFromCapabilities} from 'ol/source/WMTS';
import {TileWMS, WMTS} from 'ol/source';
import {GeoJSON, WMTSCapabilities} from 'ol/format';
import {register} from "ol/proj/proj4";
import {get} from "ol/proj";
import * as proj4x from "proj4";
import {map} from "rxjs/operators";
import {Map, Overlay, View} from "ol";
import {Tile} from "ol/layer";
import {GeoJsonLayer, LayerGroupDef, WMSLayerDef} from "./data/WMSLayerDef";
import {environment} from "../environments/environment";
import LayerGroup from "ol/layer/Group";
import {Observable} from "rxjs";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Fill, Stroke, Style} from "ol/style";
import {defaults as defaultControls} from "ol/control"
import {FloorChangerControl} from "./controls/FloorChangerControl";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'cartographe-front';
  dimension = "1"

  currentFloor: LayerGroup[] = []

  private proj4 = (proj4x as any).default
  private olMap: Map = new Map({});

  constructor(private http: HttpClient) {
  }

  private onClick(map: Map, overlay: Overlay, event: any) {
    this.closePopup()

    const pixel = map.getEventPixel(event.originalEvent)
    const coord = event.coordinate;
    const element = overlay.getElement();
    const content = document.getElementById('popup-content')!


    let htmlContent = '';
    let hasFeature = false;

    map.forEachFeatureAtPixel(pixel, (feature, layer) => {
      console.log(feature.getProperties())

      hasFeature = true;

      if (htmlContent !== '') htmlContent += "<hr/>"

      htmlContent += '<h4>Some layer</h4>';
      htmlContent += '<table>'

      for (let k of (feature as any).getKeys()) {
        if (k === 'geometry') continue;

        htmlContent += '<tr><td><strong>' + k + '</strong></td><td>' + feature.get(k) + '</td></tr>';
      }

      htmlContent += '</table>'
    })

    if (hasFeature) {
      overlay.setPosition(coord);
      content.innerHTML = htmlContent;
      element.style.display = "block";
    }


  }

  changeFloor(dim: string) {
    this.currentFloor.forEach(e => this.olMap.removeLayer(e));
    this.dimension = dim;
    this.loadFloor()
  }

  loadFloor() {
    this.getWMSLayers().subscribe(grps => {
      grps.forEach(grp => {
        this.olMap.addLayer(grp);
        this.currentFloor.push(grp);
      })
    })
    this.getGeoJsonLayers().subscribe(grps => {
      grps.forEach(grp => {
        this.olMap.addLayer(grp);
        this.currentFloor.push(grp);
      });
    })
  }

  ngOnInit() {
    this.registerEPSG2056()
    this.olMap = new Map({
      view: new View({
        center: [2533328.3, 1152120.7],
        projection: get('EPSG:2056'),
        zoom: 17,
        extent: [2532000.218049, 1150000.460788, 2534500.382181, 1155000.699121]
      }),
      layers: [],
      target: 'map',
      controls: defaultControls().extend([new FloorChangerControl(this, {})])
    });

    const popup = new Overlay({
      element: document.getElementById('popup')!
    });
    this.olMap.addOverlay(popup);

    this.olMap.on('singleclick', evt => this.onClick(this.olMap, popup, evt));

    this.createBackgroundLayer().subscribe(lyr => {
      this.olMap.getLayers().insertAt(0, lyr);
      lyr.setVisible(true);
    })

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
    return this.http.get<LayerGroupDef<WMSLayerDef>[]>(environment.backend + "wms/" + this.dimension)
      .pipe(map(content => {

        return content.map(grp => {
          const layers = grp.layers.map(layerDef => {
            return new Tile({
              source: new TileWMS({
                url: layerDef.url,
                params: layerDef.params
              }),
              opacity: 1.0,
              visible: layerDef.defaultVisibility
            })
          });

          return new LayerGroup({
            layers: layers
          })
        })
      }))
  }

  getGeoJsonLayers(): Observable<LayerGroup[]> {
    return this.http.get<LayerGroupDef<GeoJsonLayer>[]>(environment.backend + "json/" + this.dimension)
      .pipe(map(content => {

        return content.map(grp => {
          const layers = grp.layers.map(layerDef => {
            const reader = new GeoJSON();
            const features = reader.readFeatures(layerDef)
            return new VectorLayer({
              source: new VectorSource({features: features, attributions: 'PolyJapan'}),
              declutter: true,
              style: (x) => {
                return new Style({stroke: new Stroke({
                    color: 'red',
                    width: 2,
                  }), fill: new Fill({color: 'rgba(35,35,35,1.0)'})})
              }
              //interactive: true,
              //title: layerDef.name
            });
          });

          return new LayerGroup({
            layers: layers
          })
        })
      }))
  }

  closePopup() {
    document.getElementById("popup")!.style.display = 'none';
  }
}
