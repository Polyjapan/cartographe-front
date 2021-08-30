import {Style} from "./Style";

export interface AttributeBasedStyle extends Style {
  attribute: string;
  default: Style;
  mapping: { [key: string]: Style };
}
