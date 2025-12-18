import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Database, ref, get, update, remove } from '@angular/fire/database';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.less'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ProjectDetailsComponent implements OnInit {
  project: any = null;
  newTagInput: string = '';
  isAddingTags: boolean = false;
  showTagInput: boolean = false;
  isTagDeletionMode: boolean = false;
  isEditMode: boolean = false;
  isEditingName: boolean = false;
  editedName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private database: Database
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProject(projectId);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    // When toggling edit mode, also toggle tag deletion mode
    this.isTagDeletionMode = this.isEditMode;

    // Handle project name editing
    if (this.isEditMode) {
      this.startEditName();
    } else {
      // Hide the tag input if it's open and we're exiting edit mode
      this.showTagInput = false;
      // Cancel name editing if it was active
      if (this.isEditingName) {
        this.cancelEditName();
      }
    }
  }

  toggleTagDeletionMode(): void {
    this.isTagDeletionMode = !this.isTagDeletionMode;
  }

  toggleTagInput(): void {
    this.showTagInput = !this.showTagInput;
    this.newTagInput = '';
  }

  hideTagInput(): void {
    this.showTagInput = false;
    this.newTagInput = '';
  }

  startEditName(): void {
    this.isEditingName = true;
    this.editedName = this.project.name;
  }

  async saveEditedName(): Promise<void> {
    if (!this.editedName.trim() || !this.project) {
      this.cancelEditName();
      return;
    }

    try {
      const projectRef = ref(this.database, `projects/${this.project.id}`);
      await update(projectRef, {
        name: this.editedName.trim(),
        updatedAt: new Date().toISOString(),
      });

      // Update local project object
      this.project.name = this.editedName.trim();
      this.project.updatedAt = new Date().toISOString();
      this.isEditingName = false;
      this.editedName = '';
    } catch (error) {
      console.error('Error updating project name:', error);
      alert('Failed to update project name. Please try again.');
      this.cancelEditName();
    }
  }

  cancelEditName(): void {
    this.isEditingName = false;
    this.editedName = '';
  }

  async removeTag(index: number): Promise<void> {
    if (!this.project) {
      return;
    }

    const currentTags = this.project.tags || [];
    const updatedTags = currentTags.filter((_: any, i: number) => i !== index);

    try {
      const projectRef = ref(this.database, `projects/${this.project.id}`);
      await update(projectRef, {
        tags: updatedTags,
        updatedAt: new Date().toISOString(),
      });

      // Update local project object
      this.project.tags = updatedTags;
      this.project.updatedAt = new Date().toISOString();
    } catch (error) {
      console.error('Error removing tag:', error);
      alert('Failed to remove tag. Please try again.');
    }
  }

  async addTags(): Promise<void> {
    if (!this.newTagInput.trim() || !this.project) {
      return;
    }

    // Limit tag to 6 characters
    const newTag = this.newTagInput.trim().substring(0, 6);

    // No limit on number of tags
    const currentTags = this.project.tags || [];
    const updatedTags = [...currentTags, newTag];

    try {
      this.isAddingTags = true;
      const projectRef = ref(this.database, `projects/${this.project.id}`);
      await update(projectRef, {
        tags: updatedTags,
        updatedAt: new Date().toISOString(),
      });

      // Update local project object
      this.project.tags = updatedTags;
      this.project.updatedAt = new Date().toISOString();
      this.newTagInput = '';
      this.showTagInput = false; // Hide the input after adding
    } catch (error) {
      console.error('Error adding tags:', error);
      alert('Failed to add tags. Please try again.');
    } finally {
      this.isAddingTags = false;
    }
  }

  private async loadProject(projectId: string): Promise<void> {
    try {
      const projectRef = ref(this.database, `projects/${projectId}`);
      const snapshot = await get(projectRef);

      if (snapshot.exists()) {
        this.project = {
          id: projectId,
          ...snapshot.val(),
        };
      } else {
        this.project = undefined;
      }
    } catch (error) {
      console.error('Error loading project:', error);
      this.project = undefined;
    }
  }

  async deleteProject(): Promise<void> {
    if (!this.project) {
      return;
    }

    // Confirm deletion
    const confirmed = confirm(
      `Are you sure you want to delete the project "${this.project.name}"? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    try {
      const projectRef = ref(this.database, `projects/${this.project.id}`);
      // Note: This only removes the project from the projects collection
      // It does not delete any files or folders associated with the project
      await remove(projectRef);

      // Navigate back to the dashboard after successful deletion
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  }
}
