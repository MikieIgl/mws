import { Component, EventEmitter, Output } from '@angular/core';
import { Database, push, ref, get, child, set } from '@angular/fire/database';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../auth';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.less'],
  standalone: true,
  imports: [NgIf, NgFor],
})
export class FileUploadComponent {
  @Output() fileUploaded = new EventEmitter<void>();

  selectedFiles: File[] = [];
  isUploading = false;
  uploadSuccess = false;
  uploadError = false;
  errorMessage = '';

  constructor(
    private database: Database, 
    private authService: AuthService
  ) {}

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;

    if (files && files.length > 0) {
      this.selectedFiles = [];
      this.uploadError = false;
      this.errorMessage = '';

      // Validate all selected files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (this.isValidFileType(file)) {
          this.selectedFiles.push(file);
        } else {
          this.uploadError = true;
          this.errorMessage =
            'Пожалуйста, выберите только файлы формата JSON или SARIF';
          this.selectedFiles = [];
          return;
        }
      }
    }
  }

  isValidFileType(file: File): boolean {
    const validTypes = ['application/json'];
    const validExtensions = ['.json', '.sarif'];

    // Check MIME type
    if (validTypes.includes(file.type)) {
      return true;
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    return validExtensions.some((ext) => fileName.endsWith(ext));
  }

  uploadFile(): void {
    if (this.selectedFiles.length === 0) {
      this.uploadError = true;
      this.errorMessage = 'Пожалуйста, выберите файлы для загрузки';
      return;
    }

    this.isUploading = true;
    this.uploadSuccess = false;
    this.uploadError = false;
    this.errorMessage = '';

    // Read all files and merge their content
    this.readAndMergeFiles();
  }

  private readAndMergeFiles(): void {
    const fileReaders: Promise<any>[] = [];

    // Create promises for reading all files
    this.selectedFiles.forEach((file) => {
      const promise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const fileContent = e.target.result;
            const jsonData = JSON.parse(fileContent);
            resolve(jsonData);
          } catch (parseError) {
            reject(
              new Error(
                `Неверный формат файла ${file.name}. Файл должен быть в формате JSON.`
              )
            );
          }
        };
        reader.onerror = () => {
          reject(new Error(`Ошибка при чтении файла ${file.name}`));
        };
        reader.readAsText(file);
      });
      fileReaders.push(promise);
    });

    // Process all files when they're read
    Promise.all(fileReaders)
      .then((jsonDataArray: any[]) => {
        // Merge all JSON data
        const mergedData = this.mergeJsonData(jsonDataArray);
        // Upload merged data to database
        this.uploadToDatabase(mergedData);
      })
      .catch((error) => {
        this.handleUploadError(error.message || 'Ошибка при обработке файлов');
      });
  }

  private mergeJsonData(jsonDataArray: any[]): any {
    if (jsonDataArray.length === 0) {
      return {};
    }

    if (jsonDataArray.length === 1) {
      return jsonDataArray[0];
    }

    // For multiple files, merge findings arrays
    const mergedData = {
      report_id: 'merged-' + new Date().getTime(),
      status: 'completed',
      findings: [] as any[],
      stats: null,
      error: null,
      merged_from: jsonDataArray.map((data) => data.report_id),
    };

    // Combine findings from all files
    jsonDataArray.forEach((data) => {
      if (data.findings && Array.isArray(data.findings)) {
        mergedData.findings = mergedData.findings.concat(data.findings);
      }
    });

    return mergedData;
  }

  private uploadToDatabase(data: any): void {
    try {
      // Get current user information
      const currentUser: User | null = this.authService.getCurrentUser();

      const uploadData: any = {
        data: data,
        timestamp: new Date().toISOString(),
        fileCount: this.selectedFiles.length,
        fileNames: this.selectedFiles.map((f) => f.name),
      };

      // Add user information if available
      if (currentUser) {
        uploadData.userId = currentUser.uid;
        uploadData.userEmail = currentUser.email;
      } else {
        uploadData.userId = 'anonymous';
        uploadData.userEmail = 'anonymous';
      }

      const uploadsRef = ref(this.database, 'uploads');
      push(uploadsRef, uploadData)
        .then(() => {
          // Create a default dashboard project
          return this.createDefaultDashboardProject(uploadData.fileNames, uploadData.fileCount);
        })
        .then(() => {
          this.isUploading = false;
          this.uploadSuccess = true;
          this.selectedFiles = [];
          // Emit event to notify parent component
          this.fileUploaded.emit();
        })
        .catch((error) => {
          this.handleUploadError(
            'Ошибка при загрузке данных в базу: ' + error.message
          );
        });
    } catch (error: any) {
      this.handleUploadError(
        'Ошибка при подключении к базе данных: ' + error.message
      );
    }
  }

  private handleUploadError(message: string): void {
    this.isUploading = false;
    this.uploadError = true;
    this.errorMessage = message;
  }

  /**
   * Creates a default dashboard project with the name "Project1_Data"
   */
  private async createDefaultDashboardProject(fileNames: string[], fileCount: number): Promise<void> {
    try {
      const currentUser: User | null = this.authService.getCurrentUser();
      
      const projectData: any = {
        name: 'Project1_Data',
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
    } catch (error) {
      console.error('Error creating default dashboard project:', error);
      // We don't throw the error here because we don't want to fail the upload if project creation fails
    }
  }

  resetForm(): void {
    this.selectedFiles = [];
    this.isUploading = false;
    this.uploadSuccess = false;
    this.uploadError = false;
    this.errorMessage = '';
  }
}
