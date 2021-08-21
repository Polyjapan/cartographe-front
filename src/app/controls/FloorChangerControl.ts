import {Control} from "ol/control";
import {AppComponent} from "../app.component";

export class FloorChangerControl extends Control {
  constructor(component: AppComponent, opt_options: any) {
    const options = opt_options || {};

    // TODO: add display feedback of currently selected floor :) (should observe something from the other component)
    const buttons = ["0", "1", "2"].map(e => {
      const btn = document.createElement('button');
      btn.innerHTML = e;
      btn.addEventListener('click', (ev) => component.changeFloor(e), false);
      return btn;
    })

    const element = document.createElement('div');
    element.className = 'ol-unselectable ol-control';
    element.style.top = '65px';
    element.style.left = '.5em';
    buttons.forEach(btn => element.appendChild(btn));


    super({element: element, target: options.target});
  }
}
