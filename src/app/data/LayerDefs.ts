import {Style} from "../styles/Style";

export interface WMSLayerDef extends LayerDef {
  params: any;
  url: string;
  dimensions: string[];
  dimensionName: string;
  defaultVisibility: boolean;
}

export interface LayerGroupDef<T> {
  name: string;
  layers: T[];
}

export interface GeoJsonLayer extends LayerDef {
  features: [];
  style?: Style;
}

export interface LayerDef {
  title: string;
  tableName: string;
}

export interface MapDef {
  mapId: number;
  title: string;
  description: string;
}

/*

  case class MultiDimensionLayer(tablePrefix: String, attributes: List[String], prettyName: Option[String] = None,
                                 dimensions: List[String] = List("0", "1", "2"), dimensionName: String = "Étage",
                                 geometryColumn: String = "geom",
                                 dbGroup: String = "ji_2022") extends Layer

  case class MultiDimensionWMSLayer(params: Map[String, String], title: String, url: String = "https://geoportail.epfl.ch/prod/wsgi/mapserv_proxy?VERSION=1.3.0&floor={dimension}", dimensions: List[String] = List("0", "1", "2"), dimensionName: String = "Étage") extends Layer {
    val fullParams: Map[String, String] = Map("TILED" -> "true", "VERSION" -> "1.3.0") ++ params

    def forDimension(dim: String): MultiDimensionWMSLayer = MultiDimensionWMSLayer(params.view.mapValues(v => v.replaceAll("\\{dimension}", dim)).toMap, title, url.replaceAll("\\{dimension}", dim), List(dim), dimensionName)
  }


  case class Feature(geometry: Geometry, layer: String, dimension: String, data: Map[String, String])

  case class LayerData(title: String, features: List[Feature]) extends Layer

 */
