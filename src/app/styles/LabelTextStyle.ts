import {Style} from "./Style";
import {Expression} from "./Expressions";

export interface LabelTextStyle extends Style {
  font: Expression;
  color: Expression;
  offsetX?: number;
  offsetY?: number;

  // PARSER FOR CONTENT:
  // {attrName} is replaced by the value of the attribute
  // the rest we shall see, it depends on my willingness to write a fcking parser :D
  content: Expression;

  overflow: boolean;

}
