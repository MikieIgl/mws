import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  /**
   * Регистрация нового пользователя
   */
  register(email: string, password: string): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => this.handleAuthError(error));
      })
    );
  }

  /**
   * Вход пользователя
   */
  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => this.handleAuthError(error));
      })
    );
  }

  /**
   * Выход пользователя
   */
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      catchError((error) => {
        console.error('Logout error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Получить текущего пользователя
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Проверить, авторизован ли пользователь
   */
  isAuthenticated(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      // Всегда ждем изменения состояния аутентификации для корректной работы при обновлении страницы
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        observer.next(!!user);
        observer.complete();
      });

      // Cleanup функция для отписки
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    });
  }

  /**
   * Обработка ошибок Firebase Auth
   */
  private handleAuthError(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Этот email уже используется';
      case 'auth/invalid-email':
        return 'Неверный формат email';
      case 'auth/operation-not-allowed':
        return 'Операция не разрешена';
      case 'auth/weak-password':
        return 'Пароль слишком слабый';
      case 'auth/user-disabled':
        return 'Пользователь отключен';
      case 'auth/user-not-found':
        return 'Пользователь не найден';
      case 'auth/wrong-password':
        return 'Неверный пароль';
      case 'auth/too-many-requests':
        return 'Слишком много попыток. Попробуйте позже';
      default:
        return 'Произошла ошибка при аутентификации';
    }
  }
}
