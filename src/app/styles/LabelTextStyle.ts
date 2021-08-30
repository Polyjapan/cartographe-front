import {Style} from "./Style";

export interface LabelTextStyle extends Style {
  font: string;
  color: string;
  offsetX?: number;
  offsetY?: number;

  // PARSER FOR CONTENT:
  // {attrName} is replaced by the value of the attribute
  // the rest we shall see, it depends on my willingness to write a fcking parser :D
  content: string;

  overflow: boolean;

}
