import axios from 'axios';
import { API_URL } from '@env';

// Dapatkan semua barang
export const getAllBarang = (token) => {
  return axios.get(`${API_URL}/api/barang`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Dapatkan detail barang berdasarkan ID
export const getBarangById = (token, id) => {
  return axios.get(`${API_URL}/api/barang/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Tambah barang baru
export const createBarang = (token, data) => {
  return axios.post(`${API_URL}/api/barang`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Perbarui barang
export const updateBarang = (token, id, data) => {
    return axios.put(`${API_URL}/api/barang/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
};

// Hapus barang
export const deleteBarang = (token, id) => {
  return axios.delete(`${API_URL}/api/barang/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
