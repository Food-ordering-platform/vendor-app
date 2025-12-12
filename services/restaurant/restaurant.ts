import api from '../axios';
import { 
  CreateRestaurantPayload, 
  RestaurantResponse, 
  UpdateRestaurantPayload 
} from '../../types/restaurant.types';

export const restaurantService = {
    //Create a new restaurant (GO live)
  createRestaurant : async (data: CreateRestaurantPayload) : Promise<RestaurantResponse> => {
      const response = await api.post('/restaurant', data)
      return response.data
  },
  //Update Restaurant
  updateRestaurant: async ({ id, data }: UpdateRestaurantPayload): Promise<RestaurantResponse> => {
    const response = await api.put(`/restaurant/${id}`, data);
    return response.data;
  }
}