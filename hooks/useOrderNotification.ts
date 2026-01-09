import { useEffect } from 'react';
import { useSocket } from '../context/socketContext';
import { Alert, Vibration } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

export const useOrderNotification = () => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // Existing "New Order" Handler
    const handleNewOrder = async (data: any) => {
      console.log("📳 SILENT ORDER RECEIVED:", data);
      const PATTERN = [0, 1000, 500, 1000]; 
      Vibration.vibrate(PATTERN);
      Alert.alert("New Order! 🥘", `Order worth ₦${data.totalAmount} received.`, [
          { text: "View", onPress: () => Vibration.cancel() },
          { text: "Close", onPress: () => Vibration.cancel() }
      ]);
      await queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
    };

    // 👇👇 INSERT THIS NEW HANDLER 👇👇
    const handleOrderUpdate = async (data: any) => {
      console.log("🔄 Order Status Updated:", data);
      // Silently refresh the list to show new status (e.g. "Rider Found")
      await queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
    };
    // 👆👆 END INSERT 👆👆

    socket.on("new_order", handleNewOrder);
    socket.on("order_updated", handleOrderUpdate); // 👈 Listen here

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("order_updated", handleOrderUpdate); // 👈 Cleanup here
      Vibration.cancel();
    };
  }, [socket, queryClient]);
};