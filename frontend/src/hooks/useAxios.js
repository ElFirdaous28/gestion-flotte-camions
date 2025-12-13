import { useAuth } from './useAuth';
import { useMemo } from 'react';
import api from '../services/axios';
import { v4 as uuid } from 'uuid';

export const useAxios = () => {
  const { accessToken } = useAuth();
  let sessionId = localStorage.getItem('sessionId');

  if (!sessionId) {
    sessionId = uuid();
    localStorage.setItem('sessionId', sessionId);
  }
  // useMemo ensures we don't recreate instance on every render unnecessarily
  const axiosInstance = useMemo(() => {
    const instance = api;

    instance.interceptors.request.use(
      (config) => {
        config.headers['session-id'] = sessionId;
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, [accessToken, sessionId]);

  return axiosInstance;
};
