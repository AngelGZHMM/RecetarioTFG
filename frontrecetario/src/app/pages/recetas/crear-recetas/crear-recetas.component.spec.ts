import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearRecetasComponent } from './crear-recetas.component';

describe('CrearRecetasComponent', () => {
  let component: CrearRecetasComponent;
  let fixture: ComponentFixture<CrearRecetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearRecetasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearRecetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
