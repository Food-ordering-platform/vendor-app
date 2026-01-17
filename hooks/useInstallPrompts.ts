import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // 1. Safety check: This only works on Web
    if (Platform.OS !== 'web') return;

    // 2. Listen for the browser's "I'm ready to install" event
    const handleBeforeInstallPrompt = (e: any) => {
      // PREVENT the default mini-infobar so we can show our own UI
      e.preventDefault();
      
      // Save the event for later (when user clicks our button)
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("✅ PWA Install Prompt captured!");
    };

    // 3. Listen for successful install
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("✅ PWA Installed successfully");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 4. The function we call when the user clicks "Install"
  const triggerInstall = async () => {
    if (!deferredPrompt) {
      return;
    }
    
    // Show the native browser prompt
    deferredPrompt.prompt();
    
    // Wait for the user to accept or decline
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // We can't use the prompt again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, triggerInstall };
}