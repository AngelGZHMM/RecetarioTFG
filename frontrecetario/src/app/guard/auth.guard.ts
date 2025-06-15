import { inject } from "@angular/core";
import { type CanActivateFn, Router } from "@angular/router";
import { map, switchMap, of, catchError } from "rxjs";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    switchMap((isAuthenticated) => {
      if (isAuthenticated) {
        const user = authService.getCurrentUser && authService.getCurrentUser();
        return of(true);
      } else {
        if (typeof document !== 'undefined') { // Verificar si estamos en un entorno de navegador
          // Intentar obtener token de ambas fuentes: cookies Y localStorage
          let token = null;
          
          // 1. Intentar obtener de cookies
          const cookies = document.cookie.split('; ');
          const tokenCookie = cookies.find(row => row.startsWith('jwt='));
          token = tokenCookie ? tokenCookie.split('=')[1] : null;
          
          if (token && token.trim() !== "") {
            console.log("AuthGuard: Token encontrado en cookies.");
          } else {
            // 2. Si no hay token en cookies, intentar obtener de localStorage
            token = localStorage.getItem('authToken');
            if (token && token.trim() !== "") {
              console.log("AuthGuard: Token encontrado en localStorage.");
            } else {
              console.warn("AuthGuard: No se encontró token en cookies ni localStorage.");
            }
          }

          if (token && token.trim() !== "") {
            return authService.validateToken(token).pipe(
              map((isValid) => {
                if (isValid) {
                  console.log(" Token válido. Acceso permitido.");
                  return true;
                } else {
                  console.warn("AuthGuard: Token inválido o expirado. Redirigiendo al login.");
                  router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
                  return false;
                }
              }),
              catchError((err) => {
                console.error("AuthGuard: Error al validar el token:", err);
                router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
                return of(false);
              })
            );
          } else {
            console.warn("AuthGuard: No se encontró token válido. Redirigiendo al login.");
          }
        } else {
          console.error("AuthGuard: Entorno no compatible para verificar tokens.");
        }
        router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
        return of(false);
      }
    })
  );
};
