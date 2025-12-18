import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DashboardItem {
  id: string;
  name: string;
  type: string;
  location: string;
  tags: string[];
  starred: boolean;
}

@Component({
  selector: 'app-dashboards-list',
  templateUrl: './dashboards-list.component.html',
  styleUrls: ['./dashboards-list.component.less'],
  standalone: true,
  imports: [CommonModule],
})
export class DashboardsListComponent {
  viewMode: 'folders' | 'list' = 'folders';
  
  // Empty array for dashboards
  dashboards: DashboardItem[] = [];

  constructor() {}

  setViewMode(mode: 'folders' | 'list'): void {
    this.viewMode = mode;
  }
}
