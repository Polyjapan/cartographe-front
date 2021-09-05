import {Component, Input, OnInit} from '@angular/core';
import BaseLayer from "ol/layer/Base";

@Component({
  selector: 'app-layer-selector',
  templateUrl: './layer-selector.component.html',
  styleUrls: ['./layer-selector.component.css']
})
export class LayerSelectorComponent implements OnInit {
  @Input() layers?: BaseLayer[];

  constructor() { }

  ngOnInit(): void {
  }

}
