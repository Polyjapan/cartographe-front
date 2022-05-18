import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyAttributesComponent } from './modify-attributes.component';

describe('ModifyAttributesComponent', () => {
  let component: ModifyAttributesComponent;
  let fixture: ComponentFixture<ModifyAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifyAttributesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
