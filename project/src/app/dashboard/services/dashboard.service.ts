import { Injectable } from '@angular/core';
import { Database, ref, push, get, child, set } from '@angular/fire/database';
import { AuthService } from '../../auth';
import { User } from '@angular/fire/auth';

export interface DashboardProject {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  userId: string;
  fileNames: string[];
  fileCount: number;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private database: Database,
    private authService: AuthService
  ) {}

  /**
   * Creates a new dashboard project in Firebase
   */
  async createDashboardProject(projectName: string, fileNames: string[], fileCount: number): Promise<string> {
    try {
      const currentUser: User | null = this.authService.getCurrentUser();
      
      const projectData: DashboardProject = {
        id: '', // Will be set by Firebase
        name: projectName,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.email || 'anonymous',
        userId: currentUser?.uid || 'anonymous',
        fileNames: fileNames,
        fileCount: fileCount,
        tags: [] // Tags will be added interactively later
      };

      const projectsRef = ref(this.database, 'projects');
      const newProjectRef = await push(projectsRef, projectData);
      
      // Update the project with its ID
      await set(ref(this.database, `projects/${newProjectRef.key}`), {
        ...projectData,
        id: newProjectRef.key
      });

      return newProjectRef.key || '';
    } catch (error) {
      console.error('Error creating dashboard project:', error);
      throw error;
    }
  }

  /**
   * Gets all dashboard projects for the current user
   */
  async getUserProjects(): Promise<DashboardProject[]> {
    try {
      const currentUser: User | null = this.authService.getCurrentUser();
      const userId = currentUser?.uid || 'anonymous';
      
      const dbRef = ref(this.database);
      const snapshot = await get(child(dbRef, 'projects'));
      
      if (snapshot.exists()) {
        const projects: DashboardProject[] = [];
        snapshot.forEach((childSnapshot) => {
          const project = childSnapshot.val();
          // Filter projects by user ID
          if (project.userId === userId) {
            projects.push(project);
          }
        });
        return projects;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }
  }
}
