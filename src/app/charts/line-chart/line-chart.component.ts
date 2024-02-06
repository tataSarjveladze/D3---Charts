import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  GovernmentDepartments,
  SpendingEntry,
} from '../../models/chart.models';
import { DimensionsService } from '../../services/dimentions.service';

import * as d3 from 'd3';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements OnInit {
  @Input() chartData: SpendingEntry[] = [];

  departmentSelectionControl = new FormControl(GovernmentDepartments.EDUCATION);
  filteredChartData: SpendingEntry[] = [];
  departments: string[] = [];
  governmentDepartments = GovernmentDepartments;

  host: any;
  svg: any;

  xAxis: any;
  yAxis: any;

  xAxisContainer: any;
  yAxisContainer: any;
  chartContainer: any;
  legendContainer: any;
  title: any;
  yLabel: any;

  scales: any = {};

  margin = { top: 40, right: 20, bottom: 50, left: 100 };

  constructor(
    private element: ElementRef,
    private dimensions: DimensionsService
  ) {}

  ngOnInit() {
    this.host = d3.select(this.element.nativeElement);
    this.svg = this.host.select('svg.line-chart');

    this.filterChartData(this.departmentSelectionControl.value);
    this.setData();
    this.setDimensions();
    this.setElements();
    this.updateChart();
  }

  setData() {
    this.departments = [...new Set(this.chartData.map((d) => d.department))];

    this.departmentSelectionControl.valueChanges.subscribe((value) => {
      this.filterChartData(value);
      this.updateChart();
    });
  }

  filterChartData(department: string | null) {
    this.filteredChartData = this.chartData.filter(
      (d) => d.department === department
    );
  }

  setDimensions() {
    this.dimensions.defineDimensions(
      this.svg.node().getBoundingClientRect(),
      this.margin
    );
  }

  setElements() {
    this.xAxisContainer = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginBottom})`
      )
      .style('font-size', '1rem');

    this.yAxisContainer = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginTop})`
      )
      .style('font-size', '1rem');

    this.chartContainer = this.svg
      .append('g')
      .attr('class', 'chart-container')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginTop})`
      );

    this.title = this.svg
      .append('g')
      .style('font-size', '1.5rem')
      .append('text')
      .attr(
        'transform',
        `translate(${this.dimensions.middleInnerWidth}, ${this.dimensions.middleMarginTop})`
      )
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold');
  }

  setLabels() {
    this.title.text('U.S. Department spending from 2000-2022');
  }

  setParameters() {
    this.setXScale();
    this.setYScale();
    this.setColorScale();
  }

  setXScale() {
    const domain = [...new Set(this.chartData.map((d) => d.year))];
    this.scales.x = d3
      .scaleBand()
      .domain(domain)
      .range([0, this.dimensions.innerWidth]);
  }

  setYScale() {
    const maxValue =
      Number(d3.max(this.filteredChartData, (d) => d.expense)) / 10e5;

    this.scales.y = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([this.dimensions.innerHeight, 0]);
  }

  setColorScale() {
    this.scales.color = d3
      .scaleOrdinal()
      .domain(this.departments)
      .range(d3.schemeTableau10);
  }

  setAxes() {
    this.xAxis = d3.axisBottom(this.scales.x).tickSizeOuter(0);
    this.yAxis = d3
      .axisLeft(this.scales.y)
      .tickSizeOuter(0)
      .tickSizeInner(-this.dimensions.innerWidth)
      .ticks(8)
      .tickFormat((d) => (+d > 0 ? `${d3.format('$,.0f')(+d)} M` : '0'));

    this.xAxisContainer.call(this.xAxis);
    this.xAxisContainer
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end');

    this.yAxisContainer.call(this.yAxis);
    this.yAxisContainer.selectAll('.tick line').attr('stroke', '#ddd');
  }

  drawChart() {
    const line = d3
      .line()
      .x((d: any) => this.scales.x(d.year))
      .y((d: any) => this.scales.y(d.expense / 10e5));

    const path = this.chartContainer
      .append('g')
      .attr('class', 'line-chart')
      .append('path')
      .datum(this.filteredChartData)
      .attr('fill', 'none')
      .attr('stroke-width', 5)
      .attr('stroke-linecap', 'round')
      .attr('d', line)
      .style('stroke', (d: SpendingEntry[]) =>
        this.scales.color(d[0]?.department)
      );

    const totalLength = path.node().getTotalLength();

    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(800)
      .attr('stroke-dashoffset', 0);
  }

  setTooltip() {
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'line-tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('padding', '5px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px');

    const circles = this.chartContainer
      .append('g')
      .attr('class', 'circles')
      .selectAll('circle')
      .data(this.filteredChartData)
      .join('circle')
      .attr('cx', (d: SpendingEntry) => this.scales.x(d.year))
      .attr('cy', (d: SpendingEntry) => this.scales.y(+d.expense / 10e5))
      .attr('r', 5)
      .attr('fill', (d: SpendingEntry) => this.scales.color(d.department))
      .attr('cursor', 'pointer');

    circles
      .on('mouseover', (event: MouseEvent, d: SpendingEntry) => {
        tooltip
          .style('display', 'block')
          .html(
            `<p><strong>Year:</strong> ${d.year}</p>
            <p><strong>Department:</strong> ${d.department}</p>
            <p><strong>Amount Spent:</strong> ${d3.format('$,.0f')(
              +d.expense
            )}</p>`
          )
          .style('left', event.pageX + 20 + 'px')
          .style('top', event.pageY - 20 + 'px')
          .transition()
          .duration(2000);
      })
      .on('mouseleave', () => {
        d3.select('.line-tooltip').style('display', 'none');
      });
  }

  removeElements() {
    this.chartContainer.selectAll('g.line-chart').remove();
    this.chartContainer.selectAll('g.circles').remove();
    d3.select('.line-tooltip').remove();
  }

  updateChart() {
    this.removeElements();
    this.setDimensions();
    this.setLabels();
    this.setParameters();
    this.setAxes();
    this.drawChart();
    this.setTooltip();
  }
}
