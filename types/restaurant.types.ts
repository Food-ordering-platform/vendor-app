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
    prepTime:number
    isOpen:boolean
    phone:string
}

export interface UpdateRestaurantPayload{
    id:string
    data:{
        name?:string
        address:string
        phone?:string
        prepTime:number
        isOpen:boolean
    }
}

//DATA BEING SENT FROM THE BACKEND (GET REQUEST)
export interface RestaurantResponse{
    success:boolean;
    message?:string
    data:Restaurant
}