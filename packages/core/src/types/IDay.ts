import IEvent from './IEvent';

export default interface IDay {
  label: string;
  date?: Date;
  isPast?: boolean;
  events?: IEvent[];
  isCurrentMonth?: boolean;
  isToday?: boolean;
}
