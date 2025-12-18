import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FileUploadComponent } from '../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-create-with-json',
  templateUrl: './create-with-json.component.html',
  styleUrls: ['./create-with-json.component.less'],
  standalone: true,
  imports: [FileUploadComponent],
})
export class CreateWithJsonComponent implements OnInit {
  viewMode: 'folders' | 'list' = 'list';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.viewMode = params['viewMode'] === 'folders' ? 'folders' : 'list';
    });
  }

  goBack() {
    window.history.back();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
