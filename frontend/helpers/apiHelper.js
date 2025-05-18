import AsyncStorage from '@react-native-async-storage/async-storage';

export async function withAuthToken(apiFunc, ...args) {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan');
  return apiFunc(token, ...args);
}