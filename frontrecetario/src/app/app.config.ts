import { type ApplicationConfig, provideZoneChangeDetection } from "@angular/core"
import { provideRouter } from "@angular/router"
import { routes } from "./app.routes"
import { provideClientHydration, withEventReplay } from "@angular/platform-browser"
import { provideHttpClient, withInterceptorsFromDi, withFetch, HTTP_INTERCEPTORS } from "@angular/common/http"
import { AuthInterceptor } from "./services/auth.interceptor"

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
};
