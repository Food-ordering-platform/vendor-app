import { useEffect, useRef } from 'react';
import { useSocket } from '../context/socketContext';
import { Alert, Vibration, Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '../components/ui/Toast';

export const useOrderNotification = () => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  
  // Ref to control the "speaking" loop
  const speechInterval = useRef<NodeJS.Timeout | number | null>(null);

  const stopAnnouncing = () => {
    // 1. Stop Vibration
    Vibration.cancel();

    // 2. Stop Speech (Web)
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop talking immediately
      if (speechInterval.current) {
        clearInterval(speechInterval.current); // Stop the loop
        speechInterval.current = null;
      }
    }
  };

  const startAnnouncing = (message: string) => {
    // 1. Vibrate Phone (SOS Pattern)
    const PATTERN = [0, 1000, 500, 1000, 500, 1000]; 
    Vibration.vibrate(PATTERN, true);

    // 2. Speak (Web Only)
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      const speak = () => {
        // Create a new utterance every time to ensure it speaks
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.0; // Speed (0.1 to 10)
        utterance.pitch = 1.0; // Pitch (0 to 2)
        utterance.volume = 1.0; // Volume (0 to 1)
        window.speechSynthesis.speak(utterance);
      };

      // Speak immediately
      speak();

      // Loop every 4 seconds until they open the app/alert
      speechInterval.current = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          speak();
        }
      }, 4000);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = async (data: any) => {
      console.log("📳 NEW ORDER:", data);
      
      // 🟢 VOICE MESSAGE: "New Order! 4500 Naira"
      const voiceMessage = `New Order! ${data.totalAmount} Naira.`;
      
      startAnnouncing(voiceMessage);

      // Show Toast on Web
      if (Platform.OS === 'web') {
        toast.info(`New Order: ₦${data.totalAmount}`, {
            duration: Infinity, 
            action: {
                label: "View Order",
                onClick: () => stopAnnouncing()
            },
            onDismiss: () => stopAnnouncing(),
            description: "Click to stop the alarm."
        });
      }

      // Native Alert (Mobile App Fallback)
      Alert.alert(
        "New Order! 🥘", 
        `Order worth ₦${data.totalAmount} received.`, 
        [
          { text: "View", onPress: () => stopAnnouncing() },
          { text: "Close", onPress: () => stopAnnouncing(), style: "cancel" }
        ]
      );

      await queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
    };

    const handleOrderUpdate = async (data: any) => {
      await queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      
      // Optional: Speak status updates once (no loop)
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
         // e.g. "Order updated: Ready for Pickup"
         const readableStatus = data.status.replace(/_/g, ' ');
         const utterance = new SpeechSynthesisUtterance(`Order updated: ${readableStatus}`);
         window.speechSynthesis.speak(utterance);
      }
    };

    socket.on("new_order", handleNewOrder);
    socket.on("order_updated", handleOrderUpdate);

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("order_updated", handleOrderUpdate);
      stopAnnouncing();
    };
  }, [socket, queryClient]);
};