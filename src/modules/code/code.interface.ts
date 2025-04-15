export interface ICode {
  id?: string;
  code?: string;
  hashcode?: string;
  license?: string;
  agreement?: string;
  created_at?: string;
  status?: string;
}


export interface IBandAuthResponse {
  success: boolean;
  message: string;
  data?: any;
}