import IEvent from "../types/IEvent";
import { ref, Ref, computed} from 'vue';

type ISelectedEvent = {
  selectedEvent: IEvent | undefined
}

let _selectedEvent = ref<Record<string, ISelectedEvent>>({
  "__DEFAULT__": {
    selectedEvent: undefined
  }
});

export default function useSelectedEvent(calendarId?: string) {
  if (calendarId !== undefined && _selectedEvent.value[calendarId] === undefined) {
    _selectedEvent.value[calendarId] = {
      selectedEvent: undefined
    }
  }

  const setSelectedEvent = (event: IEvent | undefined) => {
    if(calendarId === undefined) {
      _selectedEvent.value.__DEFAULT__.selectedEvent = event;
    } else {
      
      _selectedEvent.value[calendarId].selectedEvent = event;
    }
  };

  const selectedEvent = computed(() => {    
    if(calendarId === undefined) {
      return _selectedEvent.value.__DEFAULT__.selectedEvent as IEvent | undefined;
    } else {
      return _selectedEvent.value[calendarId].selectedEvent as IEvent | undefined;
    }
  });

  return {
    setSelectedEvent,
    selectedEvent
  };
}
