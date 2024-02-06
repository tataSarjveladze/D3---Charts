import { Injectable } from '@angular/core';
import { ChartMargins } from '../models/chart.models';

@Injectable({
  providedIn: 'root',
})
export class DimensionsService {
  private dimensions!: DOMRect;
  private margins: ChartMargins = { top: 0, right: 0, bottom: 0, left: 0 };

  get width(): number {
    return this.dimensions?.width;
  }
  get height(): number {
    return this.dimensions?.height;
  }

  get middleWidth(): number {
    return this.width / 2;
  }
  get middleHeight(): number {
    return this.height / 2;
  }

  get innerWidth(): number {
    return this.width - (this.margins.left + this.margins.right);
  }
  get innerHeight(): number {
    return this.height - (this.margins.top + this.margins.bottom);
  }

  get middleInnerWidth(): number {
    return this.margins.left + this.innerWidth / 2;
  }
  get middleInnerHeight(): number {
    return this.margins.top + this.innerHeight / 2;
  }

  get top(): number {
    return 0;
  }
  get right(): number {
    return this.width;
  }
  get left(): number {
    return 0;
  }
  get bottom(): number {
    return this.height;
  }

  get marginTop(): number {
    return this.margins.top;
  }
  get marginRight(): number {
    return this.width - this.margins.right;
  }
  get marginLeft(): number {
    return this.margins.left;
  }
  get marginBottom(): number {
    return this.height - this.margins.bottom;
  }

  get middleMarginTop(): number {
    return this.margins.top / 2;
  }
  get middleMarginRight(): number {
    return this.width - this.margins.right / 2;
  }
  get middleMarginLeft(): number {
    return this.margins.left / 2;
  }
  get middleMarginBottom(): number {
    return this.height - this.margins.bottom / 2;
  }

  get radius(): number {
    return Math.min(this.innerWidth, this.innerHeight) / 2;
  }

  constructor() {}

  defineDimensions(dimensions: DOMRect, margins: ChartMargins): void {
    this.dimensions = dimensions;
    this.margins = margins;
  }
}
