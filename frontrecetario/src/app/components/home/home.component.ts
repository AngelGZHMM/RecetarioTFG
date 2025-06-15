import { Component, type OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  username: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(private authService: AuthService, private cookieService: CookieService) {}
  ngOnInit(): void {
    const token = this.cookieService.get('jwt'); // Obtener el token desde las cookies
    if (token) {
      this.isLoggedIn = true;
      this.authService.validateToken(token).subscribe((isValid) => {
        if (isValid) {
          const user = this.authService.getCurrentUser();
          this.username = user?.Nombre_de_usuario || null;
        } else {
          this.isLoggedIn = false;
          this.username = null;
        }
      });
    } else {
      this.isLoggedIn = false;
      this.username = null;
    }
  }
}
