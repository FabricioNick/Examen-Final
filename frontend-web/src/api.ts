import axios from 'axios';
export interface Usuario {
  id: number;
  name: string;
  email: string;
}
export interface Sesion { token: string; }
export interface Mentor {
  id: number;
  name: string;
  specialty: string;
  modality: string;
  availableSlots: number;
  description: string;
}
export interface Solicitud {
  id: number;
  resourceId: number;
  resourceName: string;
  topic: string;
  status: 'PENDING' | 'CANCELLED';
}
export interface Pagina<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
export interface ErrorApi { code: string; message: string; }

export const api = axios.create({
  baseURL: 'https://mentoriautec-api.aaron-navarro.workers.dev/api',
  headers: { 'Content-Type': 'application/json' },
});

function esPublica(url?: string) {
  return url === '/auth/login' || url === '/auth/register';
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && !esPublica(config.url)) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(res => res, error => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && !esPublica(error.config?.url)) {
    localStorage.removeItem('token');
    window.location.replace('/login');
  }
  return Promise.reject(error);
});

export function errorApi(error: unknown) {
  if (axios.isAxiosError<ErrorApi>(error) && error.response) {
    return { status: error.response.status, code: error.response.data?.code,
      message: error.response.data?.message || 'Ocurrió un error.' };
  }
  return { status: undefined, code: undefined, message: 'LA API FALLO' };
}
