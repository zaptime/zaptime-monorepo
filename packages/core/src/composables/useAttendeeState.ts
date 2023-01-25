import IStatus from "../types/IStatus";
import { ref, Ref, computed } from 'vue';

type IAttendeeState = Ref<IStatus> | Record<string, Ref<IStatus>>;
let _attendeeState: IAttendeeState = {};

export default function useAttendeeState(calendarId?: string) {
  const setAttendeeState = (status: IStatus) => {

    if (calendarId === undefined) {
      _attendeeState.value = status;
    } else {
      _attendeeState = {
        calendarId: ref(status)
      };
    }
  };

  const attendeeState = computed(() => {
    if (calendarId === undefined) {
      return _attendeeState.value as IStatus;
    }

    return _attendeeState[calendarId as keyof IAttendeeState] as IStatus;
  });

  return {
    setAttendeeState,
    attendeeState,
  };
}
