export interface HelpRequest {
  id: number;
  requester_id?: number;
  request_type: RequestType;
  details?: string;
  location_id?: number;
  disaster_type?: DisasterType;
  status: RequestStatus;
  urgency: UrgencyLevel;
  created_at: Date;
}

export enum RequestType {
  GIDA = 'gida',
  SU = 'su',
  TIBSI = 'tibsi',
  ENKAZ = 'enkaz',
  BARINMA = 'barinma'
}

export enum DisasterType {
  DEPREM = 'DEPREM',
  SEL = 'SEL',
  CIG = 'CIG',
  FIRTINA = 'FIRTINA'
}

export enum UrgencyLevel {
  DUSUK = 'dusuk',
  ORTA = 'orta',
  YUKSEK = 'yuksek'
}

export enum RequestStatus {
  BEKLEMEDE = 'beklemede',
  ONAYLANDI = 'onaylandi',
  ATANMIS = 'atanmis',
  TAMAMLANDI = 'tamamlandi',
  REDDEDILDI = 'reddedildi'
}
