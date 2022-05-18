import {Style} from "./Style";
import {Expression} from "./Expressions";

export interface ColorFillStyle extends Style {
  color: Expression;
}
