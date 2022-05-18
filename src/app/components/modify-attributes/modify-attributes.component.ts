import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Feature} from "ol";

@Component({
  selector: 'app-modify-attributes',
  templateUrl: './modify-attributes.component.html',
  styleUrls: ['./modify-attributes.component.css']
})
export class ModifyAttributesComponent implements OnInit {
  // Feature

  constructor(public dialogRef: MatDialogRef<ModifyAttributesComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {feature: Feature<any>}) { }

  ngOnInit(): void {
  }

}
