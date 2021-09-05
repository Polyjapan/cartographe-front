import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {MapsService} from "./maps.service.";
import LayerGroup from "ol/layer/Group";
import {GeoJSON, WMTSCapabilities} from "ol/format";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {getStyle} from "../styles/Style";
import {Fill, Stroke, Style} from "ol/style";
import {Tile} from "ol/layer";
import {optionsFromCapabilities} from "ol/source/WMTS";
import {TileWMS, WMTS} from "ol/source";

/**
 * This class takes a MapsService and an HTTPClient and outputs OpenLayers compatible layers
 */

@Injectable()
export class LayersService {

  constructor(private mapsService: MapsService, private http: HttpClient) {
  }

  getWMSLayers(dimension: string): Promise<LayerGroup[]> {
    return this.mapsService.getWMSLayers(dimension)
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

  getGeoJsonLayers(dimension: string): Promise<LayerGroup[]> {
    return this.mapsService.getJsonLayers(dimension)
      .toPromise()
      .then(content => {
        return content.map(grp => {
          const layers = grp.layers.map(layerDef => {
            const reader = new GeoJSON();
            const features = reader.readFeatures(layerDef).map(ft => {
              ft.set("layer", layerDef.title)
              return ft;
            })
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


}
