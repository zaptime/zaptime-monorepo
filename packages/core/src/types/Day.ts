import TimeSlot from './TimeSlot';

export default interface Day {
  label: string;
  date?: Date;
  isPast?: boolean;
  timeSlots?: TimeSlot[];
  isCurrentMonth?: boolean;
  isToday?: boolean;
}
