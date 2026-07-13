"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Offers an "Install Medja" button when the browser fires beforeinstallprompt
 * (Android/Chrome). Hidden once installed or dismissed. iOS shows nothing
 * (Safari has no programmatic install), which is fine.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!deferred || hidden) return null;

  return (
    <div className="card mb-4 flex items-center gap-3 border-primary/30 bg-primary-soft p-3">
      <div className="flex-1 text-sm font-semibold text-primary">
        Install Medja on your phone for one-tap access, offline.
      </div>
      <button
        onClick={async () => {
          await deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
        }}
        className="btn-primary px-4 py-2 text-sm"
      >
        Install
      </button>
      <button
        onClick={() => setHidden(true)}
        aria-label="Dismiss"
        className="px-2 text-muted"
      >
        ✕
      </button>
    </div>
  );
}
