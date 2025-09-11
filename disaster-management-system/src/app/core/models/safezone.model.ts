export interface Safezone {
  id: number;
  name: string;
  zone_type: ZoneType;
  location_id?: number;
  latitude?: number;
  longitude?: number;
  added_by_admin_id?: number;
  created_at: Date;
}

export enum ZoneType {
  TOPLANMA_ALANI = 'toplanma_alani',
  YARDIM_DAGITIM = 'yardim_dagitim'
}
