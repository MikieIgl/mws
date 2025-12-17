import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FileUploadComponent } from '../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-create-with-json',
  templateUrl: './create-with-json.component.html',
  styleUrls: ['./create-with-json.component.less'],
  standalone: true,
  imports: [FileUploadComponent]
})
export class CreateWithJsonComponent {
  constructor(private router: Router) {}

  goBack() {
    window.history.back();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
