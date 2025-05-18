import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const register = (data) => {
  return axios.post(`${API_URL}/api/register`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const login = (data) => axios.post(`${API_URL}/api/login`, data);

export const getProfile = (token) => {
  return axios.get(`${API_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateProfile = (token, data) => {
  return axios.put(`${API_URL}/api/profile`, data, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export async function logout() {
  await AsyncStorage.removeItem('token');
}
