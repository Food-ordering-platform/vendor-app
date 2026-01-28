//
import { useEffect, useRef } from 'react';
import { useSocket } from '../context/socketContext';
import { Alert, Vibration, Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '../components/ui/Toast';

export const useOrderNotification = () => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  
  // Ref to control the ringtone
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopRinging = () => {
    // 1. Stop Vibration
    Vibration.cancel();

    // 2. Stop Ringtone (Web)
    if (Platform.OS === 'web' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset to start
    }
  };

  const startRinging = () => {
    // 1. Vibrate Phone (SOS Pattern - Long and Aggressive)
    // [Wait, Vibrate, Wait, Vibrate...]
    const PATTERN = [0, 1000, 200, 1000, 200, 1000, 200, 2000]; 
    Vibration.vibrate(PATTERN, true); // True = Loop vibration

    // 2. Play Ringtone (Web Only)
    if (Platform.OS === 'web') {
      // Ensure you have this file in public/sounds/ringtone.mp3
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/ringtone.mp3');
        audioRef.current.loop = true; // LOOP INDEFINITELY
      }

      // Play and catch auto-play errors (browsers require interaction usually)
      audioRef.current.play().catch(e => {
        console.warn("Audio autoplay blocked until interaction:", e);
      });
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = async (data: any) => {
      console.log("🔔 NEW ORDER RECEIVED:", data);
      
      // Start the persistent ring/vibrate
      startRinging();

      // Show Toast on Web with "STOP" button
      if (Platform.OS === 'web') {
        toast.info(`New Order: ₦${data.totalAmount}`, {
            duration: Infinity, // Stay open until clicked
            action: {
                label: "Answer Order",
                onClick: () => stopRinging()
            },
            onDismiss: () => stopRinging(),
            description: "App is ringing... Click to answer."
        });
      }

      // Native Alert
      Alert.alert(
        "New Order Incoming!", 
        `Order worth ₦${data.totalAmount} received.`, 
        [
          { text: "View Order", onPress: () => stopRinging() },
          { text: "Stop Ringing", onPress: () => stopRinging(), style: "cancel" }
        ]
      );

      await queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
    };

    socket.on("new_order", handleNewOrder);

    return () => {
      socket.off("new_order", handleNewOrder);
      stopRinging(); // Cleanup on unmount
    };
  }, [socket, queryClient]);
};