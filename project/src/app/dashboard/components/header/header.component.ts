import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { KioskModeService } from '../../services/kiosk-mode.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
  standalone: true,
  imports: [RouterLink],
})
export class HeaderComponent {
  kioskModeService = inject(KioskModeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isUserPanelOpen = false;
  isSearchPanelOpen = false;
  isNotificationsPanelOpen = false;
  isNewPanelOpen = false;

  @ViewChild('userPanel') userPanel!: ElementRef;
  @ViewChild('userDropdownToggle') userDropdownToggle!: ElementRef;
  @ViewChild('searchModal') searchModal!: ElementRef;

  toggleUserPanel(): void {
    this.isUserPanelOpen = !this.isUserPanelOpen;
  }

  openSearchPanel(event?: Event): void {
    if (event) {
      event.stopPropagation();
      // Prevent default space key behavior (scrolling)
      if (event instanceof KeyboardEvent && event.key === ' ') {
        event.preventDefault();
      }
    }
    this.isSearchPanelOpen = true;
  }

  closeSearchPanel(): void {
    this.isSearchPanelOpen = false;
  }

  toggleKioskMode(): void {
    this.kioskModeService.toggle();
  }

  toggleNotificationsPanel(): void {
    this.isNotificationsPanelOpen = !this.isNotificationsPanelOpen;
  }

  toggleNewPanel(): void {
    this.isNewPanelOpen = !this.isNewPanelOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      },
    });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // Close search panel if window is resized to prevent layout issues
    if (this.isSearchPanelOpen) {
      this.closeSearchPanel();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    // Handle user panel click outside
    if (this.isUserPanelOpen) {
      const clickedInsideUserPanel = this.userPanel?.nativeElement.contains(
        event.target
      );
      const clickedInsideUserToggle =
        this.userDropdownToggle?.nativeElement.contains(event.target);

      if (!clickedInsideUserPanel && !clickedInsideUserToggle) {
        this.isUserPanelOpen = false;
      }
    }

    // Handle search panel click outside
    if (this.isSearchPanelOpen) {
      const searchContainer = document.querySelector('.search-container');
      const clickedInsideSearchContainer =
        searchContainer &&
        event.target instanceof Node &&
        searchContainer.contains(event.target);

      // Close search panel if click is outside the entire search container
      if (!clickedInsideSearchContainer) {
        this.closeSearchPanel();
      }
    }

    // Handle new panel click outside
    if (this.isNewPanelOpen) {
      const newPanel = document.querySelector('.new-panel');
      const newDropdownToggle = document.querySelector('.new-dropdown-toggle');

      const clickedInsideNewPanel =
        newPanel && event.target instanceof Node && newPanel.contains(event.target);
      const clickedInsideNewToggle =
        newDropdownToggle &&
        event.target instanceof Node &&
        newDropdownToggle.contains(event.target);

      if (!clickedInsideNewPanel && !clickedInsideNewToggle) {
        this.isNewPanelOpen = false;
      }
    }
  }
}
