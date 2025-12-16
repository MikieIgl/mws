import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor() {
    this.form = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Вычисляет силу пароля и возвращает уровень сложности
   * @param password Пароль для оценки
   * @returns Число от 0 до 4, где 0 - очень слабый, 4 - очень сильный
   */
  getPasswordStrength(password: string): number {
    if (!password) return 0;
    
    let strength = 0;
    
    // Длина пароля
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Разнообразие символов
    if (/[a-z]/.test(password)) strength++; // строчные буквы
    if (/[A-Z]/.test(password)) strength++; // заглавные буквы
    if (/[0-9]/.test(password)) strength++; // цифры
    if (/[^A-Za-z0-9]/.test(password)) strength++; // специальные символы
    
    // Максимальная оценка - 4
    return Math.min(strength, 4);
  }

  /**
   * Возвращает текстовое описание силы пароля
   * @param strength Уровень сложности пароля
   * @returns Текстовое описание
   */
  getPasswordStrengthText(strength: number): string {
    switch (strength) {
      case 0: return 'Введите пароль';
      case 1: return 'Очень слабый';
      case 2: return 'Слабый';
      case 3: return 'Средний';
      case 4: return 'Сильный';
      default: return '';
    }
  }

  /**
   * Возвращает цвет индикатора силы пароля
   * @param strength Уровень сложности пароля
   * @returns Цвет индикатора
   */
  getPasswordStrengthColor(strength: number): string {
    switch (strength) {
      case 0: return '#6b7280'; // серый
      case 1: return '#ef4444'; // красный
      case 2: return '#f97316'; // оранжевый
      case 3: return '#eab308'; // желтый
      case 4: return '#22c55e'; // зеленый
      default: return '#6b7280';
    }
  }

  /**
   * Переключает видимость пароля
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Переключает видимость подтверждения пароля
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;

    this.authService.register(email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error: string) => {
        this.errorMessage = error;
        this.isSubmitting = false;
      },
    });
  }
}
