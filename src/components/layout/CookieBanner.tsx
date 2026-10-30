import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('fryup_cookie_consent');
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // Storage is blocked in this browser: still show the preferences so the
      // visitor can choose, and simply do not remember the choice.
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('fryup_cookie_consent', 'accepted');
    } catch {
      // Storage is blocked: the choice applies to this page view only.
    }
    setVisible(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem('fryup_cookie_consent', 'essential_only');
    } catch {
      // Storage is blocked: the choice applies to this page view only.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-stone-900 text-stone-100 p-4 sm:p-6 border-t-4 border-amber-600 shadow-2xl z-50 no-print">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl text-sm">
          <h4 className="font-serif font-bold text-amber-500 text-base">Cookie & Privacy Preferences</h4>
          <p className="text-stone-300">
            Fryup.UK uses essential browser storage to save your favourite recipes and shopping lists locally. We do not track you across external websites. Read our <a href="/cookies/" className="underline text-amber-400">Cookie Policy</a> and <a href="/privacy/" className="underline text-amber-400">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleReject}
            className="flex-1 sm:flex-none px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded border border-stone-700 transition"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded transition"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
