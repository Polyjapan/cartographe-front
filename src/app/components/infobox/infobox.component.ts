import {Component, Input, OnInit} from '@angular/core';
import {Layer} from "ol/layer";
import {Collection, Feature} from "ol";
import {MatDrawer} from "@angular/material/sidenav";
import {Router} from "@angular/router";
import {MapsService} from "../../services/maps.service.";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BehaviorSubject} from "rxjs";

export interface FeatureDescription {
  layer: string;
  keys: string[];
  map: Map<string, string>;
}

@Component({
  selector: 'app-infobox',
  templateUrl: './infobox.component.html',
  styleUrls: ['./infobox.component.css']
})
export class InfoboxComponent implements OnInit {
  features: BehaviorSubject<FeatureDescription[]> = new BehaviorSubject([] as FeatureDescription[]);
  floor: string = ''

  @Input() selected?: Collection<Feature<any>>;

  constructor(private router: Router, private maps: MapsService, private snack: MatSnackBar) {
  }

  ngOnInit(): void {
    this.selected?.on('add', () => {
      this.updateSelected()
    })
    this.selected?.on('remove', () => {
      this.updateSelected()
    })
  }

  permaLink(uid: string) {
    const params = {
      floor: this.floor,
      mapId: this.maps.mapId,
      jump: uid
    }
    return window.location.protocol + '//' + window.location.host + '/' + this.router.createUrlTree(['/'], {queryParams: params})
  }

  copyLink(f: FeatureDescription) {
    const link = this.permaLink(f.map.get('uid')!!.replace('#', ';'))
    navigator.clipboard.writeText(link).then(() => {
      this.snack.open("URL copiée!", "Ok", {duration: 3500})
    })
  }

  private updateSelected() {
    const newArray = this.selected?.getArray().map(feat => {
      const keys = feat.getKeys()
        .filter(key => key !== "geometry" && key !== "layer")
        .filter(key => feat.get(key) !== 'null')
      const map = new Map<string, string>();
      keys.forEach(k => map.set(k, feat.get(k)))

      return {layer: feat.get('layer') as string, keys: keys, map: map} as FeatureDescription
    })

    this.features.next(newArray!!);
  }
}
