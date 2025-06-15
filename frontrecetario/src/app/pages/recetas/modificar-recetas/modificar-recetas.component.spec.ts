import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarRecetasComponent } from './modificar-recetas.component';

describe('ModificarRecetasComponent', () => {
  let component: ModificarRecetasComponent;
  let fixture: ComponentFixture<ModificarRecetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarRecetasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarRecetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
