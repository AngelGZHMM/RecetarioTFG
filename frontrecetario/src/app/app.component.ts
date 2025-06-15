import { Component, OnInit } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { HeaderComponent } from "./components/header/header.component"
import { HttpClientModule } from "@angular/common/http"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, HttpClientModule],
  template: `
    <app-header></app-header>
    <main>
      
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
    main {
      min-height: calc(100vh - 80px);
    }
  `,
  ],
})
export class AppComponent implements OnInit {
  title = "Recetario"

  ngOnInit(): void {
    // Apply user's preferred mode from localStorage on app startup
    const mode = localStorage.getItem('modo_oscuro_claro');
    if (mode === 'oscuro') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
