import RenderFeature from "ol/render/Feature";
import {Feature} from "ol";

export interface Expression {
  exprType: string;
  value: string;
}

export function getExpression(expr: Expression): (arg1: RenderFeature | Feature<any>) => string {
  switch (expr.exprType) {
    case 'simple':
      return (x) => {
        let text = expr.value;

          for (let k of (x as any).getKeys()) {
            if (k === 'geometry' || !x.get(k)) continue;

            text = text.replace("{" + k + "}", x.get(k))
          }
          return text;
        };

    case 'code':
      // @ts-ignore
      return (x) => window[expr.value](x)
    default:
      return (x) => 'missing expr';
  }
}

