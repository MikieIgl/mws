import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, timeout, catchError, first } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Всегда проверяем асинхронно, чтобы дождаться восстановления состояния аутентификации
  return authService.isAuthenticated().pipe(
    first(), // Берем первое значение и завершаем Observable
    timeout(5000), // Увеличиваем таймаут до 5 секунд для надежности
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
      return true;
    }),
    catchError(() => {
      // В случае ошибки или таймаута перенаправляем на login
      router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    })
  );
};
