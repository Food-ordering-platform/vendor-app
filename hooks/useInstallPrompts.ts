import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleBeforeInstallPrompt = (e: any) => {
      // 🔴 REMOVED: e.preventDefault(); 
      // We removed this line so the browser CAN show its own native mini-bar automatically.

      // We still stash the event just in case you want to trigger it manually later
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("✅ PWA Install Prompt captured (Native UI allowed)");
    };

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

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, triggerInstall };
}