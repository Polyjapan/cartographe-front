import {ColorFillStyle} from "./ColorFillStyle";
import {Fill, Stroke, Text as TextStyle} from "ol/style";
import RenderFeature from "ol/render/Feature";
import {Feature} from "ol";
import {Style as OLStyle} from "ol/style";
import {AttributeBasedStyle} from "./AttributeBasedStyle";
import {StyleUnion} from "./StyleUnion";
import {LineFillStyle} from "./LineFillStyle";
import {LabelTextStyle} from "./LabelTextStyle";

export interface Style {
  styleType: 'color' | 'union' | 'attributeBased' | 'line' | 'label'
}

export function getStyle(style: Style): (arg1: RenderFeature | Feature<any>, arg2: any) => OLStyle | OLStyle[] | void {
  switch (style.styleType) {
    case 'color':
      const color = style as ColorFillStyle;

      return (x) => new OLStyle({fill: new Fill({color: color.color})})
    case 'line':
      const line = style as LineFillStyle;

      return (x) => new OLStyle({stroke: new Stroke({width: line.width, color: color.color})})
    case 'label':
      const label = style as LabelTextStyle;

      return (x) => {
        let text = label.content;

        for (let k of (x as any).getKeys()) {
          if (k === 'geometry' || !x.get(k)) continue;

          text = text.replace("{" + k + "}", x.get(k))
        }

        return new OLStyle({text: new TextStyle({
            // font: label.font,
            offsetX: label.offsetX ?? 0, offsetY: label.offsetY ?? 0,
            // fill: new Fill({color: label.color}),
            stroke: new Stroke({color: label.color}),
            textBaseline: "middle",
            textAlign: "left",
            overflow: label.overflow,
            text: text})})
      }
    case 'attributeBased':
      const attributeBased = style as AttributeBasedStyle;

      return (x, y) => {
        const attrValue = x.get(attributeBased.attribute)
        const style = (attrValue ? attributeBased.mapping[attrValue] : undefined) ?? attributeBased.default;

        return getStyle(style)(x, y)
      }
    case 'union':
      const union = style as StyleUnion;

      return (x, y) => {
        const ret: OLStyle[] = [];

        for (const r of union.styles.map(st => getStyle(st)(x, y))) {
          if (r) {
            if (r.hasOwnProperty('length')) {
              (r as OLStyle[]).forEach(s => ret.push(s))
            } else {
              ret.push(r as OLStyle)
            }
          }
        }

        return ret;
      }

    default:
      return x => {};
  }
}
