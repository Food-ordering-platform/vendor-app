// utils/storage.ts
import * as SecureStore from 'expo-secure-store';

export const tokenStorage = {
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  }
};