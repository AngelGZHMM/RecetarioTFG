import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import  { AuthService } from "../../../services/auth.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup
  errorMessage: string | null = null
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      Nombre_de_usuario: ["", [Validators.required]],
      Contrasena: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched()
      return
    }

    this.isLoading = true
    this.errorMessage = null

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false
        // Aplicar modo claro/oscuro según preferencia del usuario
        // El backend puede devolver 'oscuro', 'claro', true, false, o undefined
        // Normaliza el valor de modo para aceptar booleanos o strings
        let modo = response?.datos?.usuario?.Modo_oscuro_claro;
        const esOscuro = (typeof modo === 'string' && modo === 'oscuro') || (typeof modo === 'boolean' && modo === true);
        if (esOscuro) {
          document.body.classList.add('dark-theme');
          localStorage.setItem('modo_oscuro_claro', 'oscuro');
        } else {
          document.body.classList.remove('dark-theme');
          localStorage.setItem('modo_oscuro_claro', 'claro');
        }
        this.router.navigate(["/home"])
      },      error: (error) => {
        this.isLoading = false
        if (error.status === 401) {
          this.errorMessage = "Nombre de usuario o contraseña incorrectos"
        } else if (error.status === 403) {
          // Manejar usuario baneado
          this.errorMessage = "Tu cuenta ha sido suspendida. No puedes acceder a la aplicación."
        } else {
          this.errorMessage = "Error al iniciar sesión. Por favor, inténtelo de nuevo más tarde."
        }
        console.error("Login error:", error)
      },
    })
  }
}
