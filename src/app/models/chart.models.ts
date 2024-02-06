export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Data {
  [year: string]: string;
  Department: string;
}

export interface SpendingEntry {
  department: string;
  year: string;
  expense: string;
}

export interface BarData {
  year: string;
  data: SpendingEntry[];
}

export interface PieData {
  data: SpendingEntry;
  endAngle: number;
  index: number;
  padAngle: number;
  startAngle: number;
  value: number;
}

// Enums
export enum GovernmentDepartments {
  DEFENSE = 'Department of Defense - Military Programs',
  EDUCATION = 'Department of Education',
  HEALTH = 'Department of Health and Human Services',
  HOMELAND = 'Department of Homeland Security',
}
