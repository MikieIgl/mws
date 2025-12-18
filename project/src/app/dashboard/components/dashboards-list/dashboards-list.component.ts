import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Database,
  ref,
  onValue,
  remove,
  update,
  get,
  set
} from '@angular/fire/database';
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
  folder?: string; // Optional folder property for folder view
}

interface FolderItem {
  name: string;
  projects: DashboardItem[];
  tags: string[]; // Add tags property for folders
}

@Component({
  selector: 'app-dashboards-list',
  templateUrl: './dashboards-list.component.html',
  styleUrls: ['./dashboards-list.component.less'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DashboardsListComponent implements OnInit {
  viewMode: 'folders' | 'list' = 'folders';
  starredFilterActive: boolean = false;
  sortOrder: 'none' | 'asc' | 'desc' = 'none';
  showSortDropdown: boolean = false;
  showTagDropdown: boolean = false;
  selectedTag: string | null = null;

  // Empty array for dashboards
  dashboards: DashboardItem[] = [];

  // Folder structure for folder view
  folders: FolderItem[] = [];

  // Track expanded folders
  expandedFolders: Set<string> = new Set<string>();

  // Track folders being edited or deleted
  editingFolder: string | null = null;
  deletingFolder: string | null = null;
  newFolderName: string = '';

  constructor(
    private database: Database,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProjects();
  }

  async loadUserProjects(): Promise<void> {
    const currentUser: User | null = this.authService.getCurrentUser();
    const userId = currentUser?.uid || 'anonymous';

    const projectsRef = ref(this.database, 'projects');
    onValue(projectsRef, async (snapshot) => {
      const data = snapshot.val();
      this.dashboards = [];
      this.folders = [];

      if (data) {
        // First, collect all projects
        const allProjects: DashboardItem[] = [];
        Object.keys(data).forEach((key) => {
          const project = data[key];
          // Filter projects by user ID
          if (project.userId === userId) {
            allProjects.push({
              id: key,
              name: project.name,
              type: 'Project',
              location: 'Local',
              tags: project.tags || [],
              starred: false,
              createdAt: project.createdAt,
              fileCount: project.fileCount,
              folder: project.folder,
            });
          }
        });

        // Organize projects by view mode
        if (this.viewMode === 'folders') {
          // Group projects by folder
          const folderMap: { [key: string]: DashboardItem[] } = {};

          allProjects.forEach((project) => {
            const folderName = project.folder || 'No folder'; // Default folder name for projects without folder
            if (!folderMap[folderName]) {
              folderMap[folderName] = [];
            }
            folderMap[folderName].push(project);
          });

          // Load folder tags from database
          const folderNames = Object.keys(folderMap);
          const folderTags = await this.loadFolderTags(userId, folderNames);

          // Apply tag filtering for folders (based on actual folder tags)
          let filteredFolderNames = folderNames;
          if (this.selectedTag) {
            // In folder view, filter based on folder tags (not project tags)
            filteredFolderNames = folderNames.filter((folderName) => {
              const tags = folderTags[folderName] || [];
              return tags.includes(this.selectedTag!);
            });
          }

          // Filter out empty folders
          filteredFolderNames = filteredFolderNames.filter(
            (folderName) => folderMap[folderName].length > 0
          );

          // Sort folders by name
          const sortedFolderNames =
            this.sortOrder === 'none'
              ? filteredFolderNames
              : filteredFolderNames.sort((a, b) => {
                  if (this.sortOrder === 'asc') {
                    return a.localeCompare(b);
                  } else {
                    return b.localeCompare(a);
                  }
                });

          // Sort projects within each folder
          sortedFolderNames.forEach((folderName) => {
            if (this.sortOrder !== 'none') {
              folderMap[folderName].sort((a, b) => {
                if (this.sortOrder === 'asc') {
                  return a.name.localeCompare(b.name);
                } else {
                  return b.name.localeCompare(a.name);
                }
              });
            }
          });

          // Convert to FolderItem array with actual folder tags
          this.folders = sortedFolderNames.map((folderName) => ({
            name: folderName,
            projects: folderMap[folderName],
            tags: folderTags[folderName] || [], // Use actual folder tags from DB
          }));
        } else {
          // In list view, show all projects
          let filteredProjects = allProjects;
          if (this.selectedTag) {
            // In list view, filter individual projects that contain the selected tag
            filteredProjects = allProjects.filter((project) =>
              project.tags.includes(this.selectedTag!)
            );
          }

          const sortedProjects = this.sortProjects(filteredProjects);
          this.dashboards = sortedProjects;
        }
      }
    });
  }

  /**
   * Loads folder tags from the database
   */
  async loadFolderTags(
    userId: string,
    folderNames: string[]
  ): Promise<{ [folderName: string]: string[] }> {
    const folderTags: { [folderName: string]: string[] } = {};

    try {
      for (const folderName of folderNames) {
        const folderTagsRef = ref(
          this.database,
          `folderTags/${userId}/${folderName}`
        );
        const snapshot = await get(folderTagsRef);
        folderTags[folderName] = snapshot.val() || [];
      }
    } catch (error) {
      console.error('Error loading folder tags:', error);
    }

    return folderTags;
  }

  /**
   * Sorts projects alphabetically by name
   */
  private sortProjects(projects: DashboardItem[]): DashboardItem[] {
    if (this.sortOrder === 'asc') {
      return [...projects].sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortOrder === 'desc') {
      return [...projects].sort((a, b) => b.name.localeCompare(a.name));
    }
    return [...projects];
  }

  setViewMode(mode: 'folders' | 'list'): void {
    this.viewMode = mode;
    this.selectedTag = null; // Reset tag filter when switching view modes
    this.loadUserProjects(); // Reload projects when view mode changes
  }

  navigateToProject(projectId: string): void {
    this.router.navigate(['/project', projectId]);
  }

  navigateToCreateWithJson(): void {
    this.router.navigate(['/create-with-json'], {
      queryParams: { viewMode: this.viewMode },
    });
  }

  /**
   * Toggles the expansion state of a folder
   */
  toggleFolder(folderName: string): void {
    if (this.expandedFolders.has(folderName)) {
      this.expandedFolders.delete(folderName);
    } else {
      this.expandedFolders.add(folderName);
    }
  }

  /**
   * Checks if a folder is currently expanded
   */
  isFolderExpanded(folderName: string): boolean {
    return this.expandedFolders.has(folderName);
  }

  /**
   * Edits the name of a folder
   */
  async editFolderName(oldName: string, newName: string): Promise<void> {
    if (!newName.trim() || oldName === newName) {
      return;
    }

    try {
      const currentUser: User | null = this.authService.getCurrentUser();
      const userId = currentUser?.uid || 'anonymous';

      // Get all projects
      const projectsRef = ref(this.database, 'projects');
      const snapshot = await get(projectsRef);
      const data = snapshot.val();

      if (data) {
        // Update folder name for all projects in this folder
        const updatePromises: Promise<void>[] = [];

        Object.keys(data).forEach((key) => {
          const project = data[key];
          // Check if this project belongs to the current user and is in the specified folder
          if (project.userId === userId && project.folder === oldName) {
            const projectRef = ref(this.database, `projects/${key}`);
            updatePromises.push(update(projectRef, { folder: newName }));
          }
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        // Reload projects to reflect changes
        this.loadUserProjects();
      }
    } catch (error) {
      console.error('Error editing folder name:', error);
      // Removed alert as requested
    }
  }

  /**
   * Deletes a folder and all projects within it
   */
  async deleteFolder(folderName: string): Promise<void> {
    // Removed confirm dialog as requested

    try {
      const currentUser: User | null = this.authService.getCurrentUser();
      const userId = currentUser?.uid || 'anonymous';

      // Get all projects
      const projectsRef = ref(this.database, 'projects');
      const snapshot = await get(projectsRef);
      const data = snapshot.val();

      if (data) {
        // Delete all projects in this folder
        const deletePromises: Promise<void>[] = [];

        Object.keys(data).forEach((key) => {
          const project = data[key];
          // Check if this project belongs to the current user and is in the specified folder
          if (project.userId === userId && project.folder === folderName) {
            const projectRef = ref(this.database, `projects/${key}`);
            deletePromises.push(remove(projectRef));
          }
        });

        // Wait for all deletions to complete
        await Promise.all(deletePromises);

        // Reload projects to reflect changes
        this.loadUserProjects();
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      // Removed alert as requested
    }
  }

  // Removed editFolder method that was using prompt

  /**
   * Creates a new tag for a project
   */
  async createTag(projectId: string, tagName: string): Promise<void> {
    if (!tagName.trim()) {
      return;
    }

    try {
      // Get the project
      const projectRef = ref(this.database, `projects/${projectId}`);
      const snapshot = await get(projectRef);
      const project = snapshot.val();

      if (project) {
        // Add the new tag to the project's tags array
        const currentTags = project.tags || [];
        const updatedTags = [...currentTags, tagName];

        // Update the project with the new tags
        await update(projectRef, {
          tags: updatedTags,
          updatedAt: new Date().toISOString(),
        });

        // Reload projects to reflect changes
        this.loadUserProjects();
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Failed to create tag. Please try again.');
    }
  }

  /**
   * Creates a new tag for a folder (separate from project tags)
   */
  async createFolderTag(folderName: string, tagName: string): Promise<void> {
    if (!tagName.trim()) {
      return;
    }

    try {
      const currentUser: User | null = this.authService.getCurrentUser();
      const userId = currentUser?.uid || 'anonymous';

      // Create/update folder tags in a separate location in the database
      const folderTagsRef = ref(
        this.database,
        `folderTags/${userId}/${folderName}`
      );
      const snapshot = await get(folderTagsRef);
      const existingTags = snapshot.val() || [];

      // Only add the tag if it doesn't already exist
      if (!existingTags.includes(tagName)) {
        const updatedTags = [...existingTags, tagName];
        await set(folderTagsRef, updatedTags);
      }

      // Reload projects to reflect changes
      this.loadUserProjects();
    } catch (error) {
      console.error('Error creating folder tag:', error);
      alert('Failed to create folder tag. Please try again.');
    }
  }

  /**
   * Adds a tag to a project
   */
  addTag(projectId: string): void {
    const tagName = prompt('Enter tag name:');
    if (tagName) {
      this.createTag(projectId, tagName);
    }
  }

  /**
   * Adds a tag to a folder
   */
  addFolderTag(folderName: string): void {
    const tagName = prompt('Enter tag name for folder:');
    if (tagName) {
      this.createFolderTag(folderName, tagName);
    }
  }

  /**
   * Starts editing a folder
   */
  startEditingFolder(folderName: string): void {
    this.editingFolder = folderName;
    this.newFolderName = folderName;
  }

  /**
   * Cancels editing a folder
   */
  cancelEditingFolder(): void {
    this.editingFolder = null;
    this.newFolderName = '';
  }

  /**
   * Closes the sort dropdown when clicking outside
   */
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    const sortContainer = document.querySelector('.sort-container');
    const tagContainer = document.querySelector('.tag-filter-container');

    if (
      this.showSortDropdown &&
      sortContainer &&
      !sortContainer.contains(target)
    ) {
      this.showSortDropdown = false;
    }

    if (
      this.showTagDropdown &&
      tagContainer &&
      !tagContainer.contains(target)
    ) {
      this.showTagDropdown = false;
    }
  }

  /**
   * Toggles the starred filter
   */
  toggleStarredFilter(event: any): void {
    this.starredFilterActive = event.target.checked;
  }

  /**
   * Sets the sort order
   */
  setSortOrder(order: 'none' | 'asc' | 'desc'): void {
    this.sortOrder = order;
    this.loadUserProjects();
  }

  /**
   * Toggles the sort dropdown visibility
   */
  toggleSortDropdown(event: Event): void {
    event.stopPropagation(); // Prevent event from bubbling up to document
    this.showSortDropdown = !this.showSortDropdown;
  }

  /**
   * Starts deleting a folder
   */
  startDeletingFolder(folderName: string): void {
    this.deletingFolder = folderName;
  }

  /**
   * Cancels deleting a folder
   */
  cancelDeletingFolder(): void {
    this.deletingFolder = null;
  }

  /**
   * Confirms deleting a folder
   */
  confirmDeletingFolder(): void {
    if (this.deletingFolder) {
      this.deleteFolder(this.deletingFolder);
    }
    this.cancelDeletingFolder();
  }

  /**
   * Confirms editing a folder
   */
  confirmEditingFolder(): void {
    if (this.editingFolder && this.newFolderName.trim()) {
      this.editFolderName(this.editingFolder, this.newFolderName.trim());
    }
    this.cancelEditingFolder();
  }

  /**
   * Toggles the tag dropdown visibility
   */
  toggleTagDropdown(event: Event): void {
    event.stopPropagation(); // Prevent event from bubbling up to document
    this.showTagDropdown = !this.showTagDropdown;
  }

  /**
   * Sets the selected tag for filtering
   */
  setSelectedTag(tag: string | null): void {
    this.selectedTag = tag;
    this.showTagDropdown = false;
    this.loadUserProjects();
  }

  /**
   * Gets all unique tags from projects
   */
  getAllTags(): string[] {
    const allTags = new Set<string>();

    // Depending on view mode, show different tags
    if (this.viewMode === 'folders') {
      // In folder view, show folder tags
      this.folders.forEach((folder) => {
        folder.tags.forEach((tag) => {
          allTags.add(tag);
        });
      });
    } else {
      // In list view, collect tags from individual projects
      this.dashboards.forEach((project) => {
        project.tags.forEach((tag) => {
          allTags.add(tag);
        });
      });
    }

    return Array.from(allTags).sort();
  }

  /**
   * Gets unique tags for a specific folder
   */
  getFolderTags(folder: FolderItem): string[] {
    return folder.tags;
  }
}
