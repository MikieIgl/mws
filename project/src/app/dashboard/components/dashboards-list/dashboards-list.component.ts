import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database, ref, onValue } from '@angular/fire/database';
import { AuthService } from '../../../auth';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';

interface DashboardItem {
  id: string;
  name: string;
  type: string;
  location: string;
  tags: string[];
  starred: boolean;
  createdAt: string;
  fileCount: number;
}

@Component({
  selector: 'app-dashboards-list',
  templateUrl: './dashboards-list.component.html',
  styleUrls: ['./dashboards-list.component.less'],
  standalone: true,
  imports: [CommonModule],
})
export class DashboardsListComponent implements OnInit {
  viewMode: 'folders' | 'list' = 'folders';
  
  // Empty array for dashboards
  dashboards: DashboardItem[] = [];

  constructor(
    private database: Database,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProjects();
  }

  loadUserProjects(): void {
    const currentUser: User | null = this.authService.getCurrentUser();
    const userId = currentUser?.uid || 'anonymous';
    
    const projectsRef = ref(this.database, 'projects');
    onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      this.dashboards = [];
      
      if (data) {
        Object.keys(data).forEach(key => {
          const project = data[key];
          // Filter projects by user ID
          if (project.userId === userId) {
            this.dashboards.push({
              id: key,
              name: project.name,
              type: 'Project',
              location: 'Local',
              tags: project.tags || [],
              starred: false,
              createdAt: project.createdAt,
              fileCount: project.fileCount
            });
          }
        });
      }
    });
  }

  setViewMode(mode: 'folders' | 'list'): void {
    this.viewMode = mode;
  }

  navigateToProject(projectId: string): void {
    this.router.navigate(['/project', projectId]);
  }
}
