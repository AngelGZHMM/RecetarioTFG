import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonFavoritoComponent } from './boton-favorito.component';

describe('BotonFavoritoComponent', () => {
  let component: BotonFavoritoComponent;
  let fixture: ComponentFixture<BotonFavoritoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonFavoritoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotonFavoritoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
