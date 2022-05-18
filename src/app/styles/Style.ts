import {ColorFillStyle} from "./ColorFillStyle";
import {Fill, Stroke, Text as TextStyle} from "ol/style";
import RenderFeature from "ol/render/Feature";
import {Feature} from "ol";
import {Style as OLStyle} from "ol/style";
import {Icon, Circle} from "ol/style";
import {AttributeBasedStyle} from "./AttributeBasedStyle";
import {StyleUnion} from "./StyleUnion";
import {LineFillStyle} from "./LineFillStyle";
import {LabelTextStyle} from "./LabelTextStyle";
import {getExpression} from "./Expressions";
import {CircleStyle} from "./CircleStyle";
import {IconStyle} from "./IconStyle";

export interface Style {
  styleType: 'color' | 'union' | 'attributeBased' | 'line' | 'label' | 'circle' | 'icon'
}

export function getStyle(style: Style): (arg1: RenderFeature | Feature<any>, arg2: any) => OLStyle | OLStyle[] | void {
  switch (style.styleType) {
    case 'color':
      const colorFunc = getExpression((style as ColorFillStyle).color);

      return (x) => new OLStyle({fill: new Fill({color: colorFunc(x)})})

    case 'line':
      const line = style as LineFillStyle;

      return (x) => new OLStyle({stroke: new Stroke({width: line.width, color: line.color})})

    case 'circle':
      const circle = style as CircleStyle;
      const baseStyle: {radius: number, stroke?: Stroke, fill?: Fill} = {radius: circle.radius}

      if (circle.stroke)
        baseStyle.stroke = new Stroke({width: circle.stroke.width, color: circle.stroke.color})

      if (circle.fill) {
        const fillColorFunc = getExpression(circle.fill.color);

        return (x) => {
          const copiedStyle = Object.assign({}, baseStyle);
          copiedStyle.fill = new Fill({color: fillColorFunc(x)})

          return new OLStyle({image: new Circle(copiedStyle)})
        }
      } else {
        return (x) => new OLStyle({image: new Circle(baseStyle)})
      }


   case 'icon':
      const icon = style as IconStyle;

      return (x) => new OLStyle({image: new Icon({src: icon.src})})

    case 'label':
      const label = style as LabelTextStyle;
      const content = getExpression(label.content);
      const labelFont = getExpression(label.font);
      const labelColor = getExpression(label.color);

      return (x) => {
        let text = content(x);

        return new OLStyle({text: new TextStyle({
            // font: label.font,
            offsetX: label.offsetX ?? 0, offsetY: label.offsetY ?? 0,
            // fill: new Fill({color: label.color}),
            stroke: new Stroke({color: labelColor(x)}),
            textBaseline: "middle",
            textAlign: "center",

            overflow: label.overflow,
            font: labelFont(x),
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
