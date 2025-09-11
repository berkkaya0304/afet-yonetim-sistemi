export interface Assignment {
  id: number;
  volunteer_id?: number;
  request_id?: number;
  status: AssignmentStatus;
  assigned_at: Date;
  completed_at?: Date;
}

export enum AssignmentStatus {
  ATANMIS = 'atanmis',
  YOLDA = 'yolda',
  TAMAMLANDI = 'tamamlandi',
  IPTAL_EDILDI = 'iptal_edildi'
}

