import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable, map } from 'rxjs';
import { DataService } from './services/data.service';
import { Data, SpendingEntry } from './models/chart.models';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { HttpClientModule } from '@angular/common/http';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [DataService],
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    LineChartComponent,
    PieChartComponent,
    BarChartComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'charts';
  data$: Observable<SpendingEntry[]> | undefined;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.data$ = this.dataService
      .getParsedJson('assets/us-spending-since-2000-v3.json')
      .pipe(
        map((data: Data[]) => {
          console.log('data', data);
          return data
            .map((element) => {
              const department = element.Department;
              const objectEntries = Object.entries(element);

              return objectEntries
                .filter(([key, value]) => key !== 'Department')
                .map(([key, value]) => ({
                  department,
                  year: key,
                  expense: value,
                }));
            })
            .flat();
        })
      );
  }
}
