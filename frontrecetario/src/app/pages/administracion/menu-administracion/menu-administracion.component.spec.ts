import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuAdministracionComponent } from './menu-administracion.component';

describe('MenuAdministracionComponent', () => {
  let component: MenuAdministracionComponent;
  let fixture: ComponentFixture<MenuAdministracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuAdministracionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuAdministracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
