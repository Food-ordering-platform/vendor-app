export interface Restaurant {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  imageUrl?: string;
  prepTime:number;
  isOpen:boolean;
  ownerId:string;
  minimumOrder:number
}
//Data being sent to the backend (POST REQUEST)
export interface CreateRestaurantPayload{
    name: string
    address:string
    prepTime:string | number
    isOpen:boolean
    email:string
    phone:string
    imageUri?:string | null
}

export interface UpdateRestaurantPayload{
    id:string
    data:CreateRestaurantPayload
}

//DATA BEING SENT FROM THE BACKEND (GET REQUEST)
export interface RestaurantResponse{
    success:boolean;
    message?:string
    data:Restaurant
}