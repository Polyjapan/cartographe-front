import {Style} from "./Style";
import {LineFillStyle} from "./LineFillStyle";
import {ColorFillStyle} from "./ColorFillStyle";

export interface CircleStyle extends Style {
  stroke?: LineFillStyle;
  radius: number;
  fill?: ColorFillStyle;
}
