export interface Announcement {
  id: number;
  admin_id?: number;
  title: string;
  content: string;
  created_at: Date;
}
