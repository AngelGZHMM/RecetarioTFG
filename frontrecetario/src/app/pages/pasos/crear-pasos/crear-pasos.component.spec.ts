import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPasosComponent } from './crear-pasos.component';

describe('CrearPasosComponent', () => {
  let component: CrearPasosComponent;
  let fixture: ComponentFixture<CrearPasosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPasosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPasosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
