import { useEffect } from 'react';
import { useSocket } from '../context/socketContext';
import { Alert, Vibration, Platform } from 'react-native'; // <--- Import Vibration
import { useQueryClient } from '@tanstack/react-query';

export const useOrderNotification = () => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = async (data: any) => {
      console.log("📳 SILENT ORDER RECEIVED:", data);

      // 1. VIBRATE THE PHONE
      // Android: Vibrate for 1s, Pause 0.5s, Vibrate 1s (Like a phone call)
      // iOS: Just vibrates once (Apple is strict about patterns)
      const PATTERN = [0, 1000, 500, 1000]; 
      Vibration.vibrate(PATTERN);

      // 2. Show Alert
      Alert.alert(
        "New Order! 🥘", 
        `Order worth ₦${data.totalAmount} received.`,
        [
          { 
            text: "View", 
            onPress: () => {
              // Stop vibration when they click "View"
              Vibration.cancel();
            } 
          },
          {
            text: "Close",
            onPress: () => Vibration.cancel() // Stop vibration on close
          }
        ]
      );

      // 3. Refresh the List
      await queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
    };

    socket.on("new_order", handleNewOrder);

    return () => {
      socket.off("new_order", handleNewOrder);
      Vibration.cancel(); // Cleanup: Stop shaking if they leave the app
    };
  }, [socket, queryClient]);
};