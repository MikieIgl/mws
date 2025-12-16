import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, User, updateProfile } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.less'],
  standalone: true,
  imports: [FormsModule]
})
export class EditProfileComponent implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);

  currentUser: User | null = null;
  userFullName: string = 'Игловский Михаил Александрович';
  userUsername: string = '@m.iglovskiy';
  userEmail: string = 'm.iglovskiy@example.com';
  isEditing: boolean = false;
  editedFullName: string = '';
  editedUsername: string = '';

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    this.currentUser = this.auth.currentUser;
    if (this.currentUser) {
      this.userFullName = this.currentUser.displayName || this.userFullName;
      this.userEmail = this.currentUser.email || this.userEmail;
      // Try to get username from localStorage first, fallback to email-based username
      const storedUsername = localStorage.getItem('userUsername');
      if (storedUsername) {
        this.userUsername = storedUsername;
      } else {
        this.userUsername = `@${this.currentUser.email?.split('@')[0] || this.userUsername}`;
      }
      this.editedFullName = this.userFullName;
      this.editedUsername = this.userUsername;
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editedFullName = this.userFullName;
      this.editedUsername = this.userUsername;
    }
  }

  validateFullName(name: string): boolean {
    // Allow only letters, spaces, and hyphens
    const nameRegex = /^[a-zA-Zа-яА-Я\s\-]+$/;
    return nameRegex.test(name);
  }

  saveChanges(): void {
    if (this.currentUser) {
      // Validate full name
      if (!this.validateFullName(this.editedFullName)) {
        alert('Full name can only contain letters, spaces, and hyphens');
        return;
      }

      // Add @ prefix to username if not present
      if (this.editedUsername && !this.editedUsername.startsWith('@')) {
        this.editedUsername = '@' + this.editedUsername;
      }

      updateProfile(this.currentUser, {
        displayName: this.editedFullName
      }).then(() => {
        this.userFullName = this.editedFullName;
        this.userUsername = this.editedUsername;
        // Save username to localStorage for reactive updates in header
        localStorage.setItem('userUsername', this.editedUsername);
        this.isEditing = false;
      }).catch((error) => {
        console.error('Error updating profile:', error);
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editedFullName = this.userFullName;
    this.editedUsername = this.userUsername;
  }

  getUserInitials(): string {
    if (this.currentUser) {
      // Generate initials from display name or email
      if (this.currentUser.displayName) {
        const names = this.currentUser.displayName.split(' ');
        return names.length > 1 
          ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
          : names[0][0].toUpperCase();
      } else if (this.currentUser.email) {
        const emailName = this.currentUser.email.split('@')[0];
        return emailName.substring(0, 2).toUpperCase();
      }
    }
    // Default initials
    return 'U';
  }
 
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
