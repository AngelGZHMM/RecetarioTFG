import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import {  Router, RouterLink } from "@angular/router"
import  { AuthService } from "../../../services/auth.service"

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent {
  registerForm: FormGroup
  errorMessage: string | null = null
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        Nombre_de_usuario: ["", [Validators.required, Validators.minLength(3)]],
        Gmail: ["", [Validators.required, Validators.email]],
        Contrasena: ["", [Validators.required, Validators.minLength(6)]],
        confirmarContrasena: ["", [Validators.required]],
        Nombre: ["", [Validators.required]],
        Apellidos: ["", [Validators.required]],
        Aceptacion_TYC: [false, [Validators.requiredTrue]],
        Aceptacion_Politica: [false, [Validators.requiredTrue]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    )
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("Contrasena")?.value
    const confirmPassword = form.get("confirmarContrasena")?.value

    if (password !== confirmPassword) {
      form.get("confirmarContrasena")?.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }

    return null
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched()
      return
    }

    this.isLoading = true
    this.errorMessage = null

    // Eliminar el campo confirmarContrasena antes de enviar
    const userData = { ...this.registerForm.value }
    delete userData.confirmarContrasena

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading = false
        this.router.navigate(["/login"], {
          queryParams: { registered: "success" },
        })
      },
      error: (error) => {
        this.isLoading = false
        if (error.status === 409) {
          this.errorMessage = "El nombre de usuario o correo electrónico ya está registrado"
        } else {
          this.errorMessage = "Error al registrar. Por favor, inténtelo de nuevo más tarde."
        }
        console.error("Register error:", error)
      },
    })
  }
}
