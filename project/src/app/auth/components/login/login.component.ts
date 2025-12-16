import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    // При инициализации компонента можно выполнить дополнительные действия, если необходимо
  }

  /**
   * Переключает видимость пароля
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigateByUrl(returnUrl);
      },
      error: (error: string) => {
        this.errorMessage = error;
        this.isSubmitting = false;
      },
    });
  }
}
