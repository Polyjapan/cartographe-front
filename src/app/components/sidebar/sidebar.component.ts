import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import RenderFeature from "ol/render/Feature";
import {Layer} from "ol/layer";
import {Feature} from "ol";
import {MatDrawer} from "@angular/material/sidenav";
import {Router} from "@angular/router";
import {MapsService} from "../../services/maps.service.";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  features: [any, Layer<any>][] = [];
  floor: string = ''

  @Input() drawer?: MatDrawer;

  constructor(private router: Router, private maps: MapsService, private snack: MatSnackBar) { }

  ngOnInit(): void {
  }

  setFeatures(floor: string, features: [any, Layer<any>][]) {
    this.features = features;
    this.floor = floor;

    if (features && features.length > 0) {
      this.drawer?.open();
    } else {
      this.drawer?.close();
    }
  }

  clear() {
    this.setFeatures('', []);
  }

  permaLink(uid: string) {
    const params = {
      floor: this.floor,
      mapId: this.maps.mapId,
      jump: uid
    }
    return window.location.protocol + '//' + window.location.host + '/' + this.router.createUrlTree(['/'], {queryParams: params})
  }

  copyLink(f: any) {
    for (let k of f) {
      if (k[0] === 'uid') {
        const link = this.permaLink((k[1] as string).replace('#', ';'))
        navigator.clipboard.writeText(link).then(() => {
          this.snack.open("URL copiée!")
        })
      }
    }
  }
}
