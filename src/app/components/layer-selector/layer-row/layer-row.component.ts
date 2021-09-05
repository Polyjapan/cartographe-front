import {Component, Input, OnInit} from '@angular/core';
import BaseLayer from "ol/layer/Base";

@Component({
  selector: 'tr[app-layer-row]',
  templateUrl: './layer-row.component.html',
  styleUrls: ['./layer-row.component.css']
})
export class LayerRowComponent implements OnInit {
  @Input() layer?: BaseLayer;

  expanded = false;

  constructor() { }

  ngOnInit(): void {
  }

}
