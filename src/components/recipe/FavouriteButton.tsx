import React, { useState, useEffect } from 'react';

interface Props {
  slug: string;
  title: string;
}

interface SavedFavourite {
  slug: string;
  title: string;
  savedAt: string;
}

export default function FavouriteButton({ slug, title }: Props) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fryup_favourites');
      if (!saved) return;
      const list = JSON.parse(saved);
      if (Array.isArray(list)) {
        setIsSaved(list.some((item: SavedFavourite) => item?.slug === slug));
      }
    } catch {
      // Storage is blocked or the saved list is malformed: start unsaved.
    }
  }, [slug]);

  const toggleSave = () => {
    try {
      const saved = localStorage.getItem('fryup_favourites');
      let list: SavedFavourite[] = [];
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          list = parsed as SavedFavourite[];
        }
      }

      const next = isSaved
        ? list.filter((item) => item.slug !== slug)
        : [...list, { slug, title, savedAt: new Date().toISOString() }];

      // Store first, so the button never claims a save that did not happen.
      localStorage.setItem('fryup_favourites', JSON.stringify(next));
      setIsSaved(!isSaved);
    } catch {
      // Storage is blocked or the saved list is malformed: leave it as it was.
    }
  };

  return (
    <button
      onClick={toggleSave}
      className={`px-4 py-2 rounded text-sm font-semibold border transition flex items-center gap-2 no-print ${
        isSaved
          ? 'bg-amber-100 border-amber-400 text-amber-900'
          : 'bg-white border-stone-300 hover:bg-stone-50 text-stone-700'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 ${isSaved ? 'fill-amber-600 stroke-amber-600' : 'fill-none stroke-current'}`}
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>{isSaved ? 'Saved in Favourites' : 'Save to Favourites'}</span>
    </button>
  );
}
