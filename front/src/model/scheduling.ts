export interface AvailableTime {
  time: string;
  qty: number;
}

export interface Scheduling {
  date: string;
  times: Array<AvailableTime>
}