import { Component, ElementRef, Input } from '@angular/core';
import { SpendingEntry, BarData } from '../../models/chart.models';
import { DimensionsService } from '../../services/dimentions.service';

import * as d3 from 'd3';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent {
  @Input() chartData: SpendingEntry[] = [];

  BarData: BarData[] = [];

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

  margin = { top: 50, right: 15, bottom: 200, left: 100 };

  constructor(
    private element: ElementRef,
    private dimensions: DimensionsService
  ) {}

  ngOnInit() {
    this.host = d3.select(this.element.nativeElement);
    this.svg = this.host.select('svg');

    this.BarData = d3
      .groups(this.chartData, (d: SpendingEntry) => d.year)
      .slice(-5)
      .map((element) => ({
        year: element[0],
        data: element[1],
      }));

    this.setDimensions();
    this.setElements();
    this.updateChart();
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
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginTop})`
      );

    this.legendContainer = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${
          this.dimensions.marginBottom + 50
        })`
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
    this.title.text('U.S. spending from 2018-2022');
  }

  setParameters() {
    this.setXScales();
    this.setYScales();
    this.setGroupScale();
    this.setColorScale();
  }

  setXScales() {
    const years = this.chartData.map((d) => d.year).slice(-5);
    this.scales.x = d3
      .scaleBand()
      .domain(years)
      .rangeRound([0, this.dimensions.innerWidth])
      .padding(0.1);
  }

  setYScales() {
    const expenses = this.BarData.map((d) => d.data).flat();
    const maxValue = Number(d3.max(expenses, (d) => d.expense)) / 10e5;

    this.scales.y = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([this.dimensions.innerHeight, 0]);
  }

  setGroupScale() {
    const groups = [...new Set(this.chartData.map((d) => d.department))];
    this.scales.group = d3
      .scaleBand()
      .domain(groups)
      .range([0, this.scales.x.bandwidth()]);
  }

  setColorScale() {
    const groups = [...new Set(this.chartData.map((d) => d.department))];
    this.scales.color = d3
      .scaleOrdinal()
      .domain(groups)
      .range(['#008080', '#800080', '#FF8C00', '#4682B4']);
  }

  setAxes() {
    this.setXAxis();
    this.setYAxis();
  }

  setXAxis() {
    this.xAxis = d3.axisBottom(this.scales.x).tickSizeOuter(0);
    this.xAxisContainer.call(this.xAxis);
  }

  setYAxis() {
    this.yAxis = d3
      .axisLeft(this.scales.y)
      .ticks(7)
      .tickSizeOuter(0)
      .tickSizeInner(-this.dimensions.innerWidth)
      .tickFormat((d) => (+d > 0 ? `${d3.format('$,.0f')(+d)} M` : '0'));

    this.yAxisContainer.call(this.yAxis);
    this.yAxisContainer.selectAll('.tick line').attr('stroke', '#ddd');
  }

  setLegend() {
    const legend = this.legendContainer
      .selectAll('g')
      .data(this.BarData[0].data)
      .join('g')
      .attr(
        'transform',
        (d: SpendingEntry, i: number) => `translate(0, ${40 * i})`
      );

    legend
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', (d: SpendingEntry, i: number) =>
        this.scales.color(d.department)
      );

    legend
      .append('text')
      .attr('x', 30)
      .attr('y', 15)
      .text((d: SpendingEntry) => d.department);
  }

  drawBars() {
    this.chartContainer
      .selectAll('g.group')
      .data(this.BarData.map((d) => d.year))
      .join('g')
      .attr('class', 'group')
      .style('fill', (d: string) => this.scales.color(d))
      .selectAll('rect.data')
      .data((d: string) => this.BarData.find((e) => e.year === d)?.data)
      .join('rect')
      .attr(
        'x',
        (d: SpendingEntry) =>
          this.scales.x(d.year) + this.scales.group(d.department)
      )
      .attr('y', (d: SpendingEntry) => this.scales.y(Number(d.expense) / 10e5))
      .attr('width', this.scales.group.bandwidth())
      .attr(
        'height',
        (d: SpendingEntry) =>
          this.dimensions.innerHeight - this.scales.y(Number(d.expense) / 10e5)
      )
      .attr('fill', (d: SpendingEntry) => this.scales.color(d.department))
      .attr('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: SpendingEntry) => {
        this.highlightDepartment(d.department, d.year);
        this.setTooltip(event, d);
      })
      .on('mouseleave', () => {
        this.chartContainer.selectAll('rect').attr('opacity', 1);
        d3.selectAll('div.tooltip').remove();
      });
  }

  highlightDepartment(department: string, year: string) {
    this.chartContainer
      .selectAll('rect')
      .attr('opacity', (d: SpendingEntry) =>
        d.department === department && d.year === year ? 1 : 0.5
      );
  }

  setTooltip(event: MouseEvent, data: SpendingEntry) {
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('padding', '5px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px');

    tooltip
      .html(
        `<p><strong>Year:</strong> ${data.year}</p>
        <p><strong>Department:</strong> ${data.department}</p>
        <p><strong>Amount Spent:</strong> ${d3.format('$,.0f')(
          +data.expense
        )}</p>`
      )
      .style('left', event.pageX + 'px')
      .style('top', event.pageY + 'px');
  }

  updateChart() {
    this.setLabels();
    this.setParameters();
    this.setAxes();
    this.setLegend();
    this.drawBars();
  }
}
