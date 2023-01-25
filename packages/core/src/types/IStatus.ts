export default interface IStatus {
  id: number;
  uuid: string;
  event_id: number;
  status: "reserved" | "canceled" | "confirmed" | "synced";
  email: string;
  phone: string | null;
  firstname: string | null;
  lastname: string | null;
  created_at: string;
  updated_at: string;
}
