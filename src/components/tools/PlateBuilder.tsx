import React, { useState } from 'react';
import { FDC_ATTRIBUTION, formatPer100gLine, nutritionForPlateComponent } from '../../lib/nutrition';

interface ComponentItem {
  id: string;
  name: string;
  category: string;
  defaultQty: number;
  unit: string;
  prepTime: number;
  cookTime: number;
  recipeSlug: string;
}

const AVAILABLE_COMPONENTS: ComponentItem[] = [
  { id: 'sausage', name: 'Cumberland Sausages', category: 'Protein', defaultQty: 2, unit: 'links', prepTime: 2, cookTime: 18, recipeSlug: 'cumberland-sausage-fry-up' },
  { id: 'bacon', name: 'Smoked Back Bacon', category: 'Protein', defaultQty: 2, unit: 'rashers', prepTime: 1, cookTime: 6, recipeSlug: 'pan-fried-british-back-bacon' },
  { id: 'blackpudding', name: 'Bury Black Pudding', category: 'Protein', defaultQty: 1, unit: 'slices', prepTime: 2, cookTime: 6, recipeSlug: 'proper-pan-fried-black-pudding' },
  { id: 'egg', name: 'Crispy Fried Eggs', category: 'Eggs', defaultQty: 1, unit: 'items', prepTime: 1, cookTime: 3, recipeSlug: 'crispy-edged-fried-eggs' },
  { id: 'beans', name: 'British Baked Beans', category: 'Sides', defaultQty: 100, unit: 'g', prepTime: 1, cookTime: 5, recipeSlug: 'homemade-british-style-baked-beans' },
  { id: 'mushrooms', name: 'Buttered Mushrooms', category: 'Sides', defaultQty: 75, unit: 'g', prepTime: 3, cookTime: 6, recipeSlug: 'buttered-button-mushrooms' },
  { id: 'tomato', name: 'Grilled Tomato Halves', category: 'Sides', defaultQty: 2, unit: 'halves', prepTime: 2, cookTime: 5, recipeSlug: 'grilled-breakfast-tomatoes' },
  { id: 'hashbrown', name: 'Homemade Hash Browns', category: 'Carbs', defaultQty: 2, unit: 'patties', prepTime: 10, cookTime: 12, recipeSlug: 'homemade-hash-browns' },
  { id: 'friedbread', name: 'Traditional Fried Bread', category: 'Carbs', defaultQty: 1, unit: 'slices', prepTime: 1, cookTime: 4, recipeSlug: 'traditional-fried-bread' },
  { id: 'toast', name: 'Toasted Farmhouse Bread', category: 'Carbs', defaultQty: 1, unit: 'slices', prepTime: 1, cookTime: 3, recipeSlug: 'toasted-farmhouse-bread-with-butter' }
];

export default function PlateBuilder() {
  const [diners, setDiners] = useState(2);
  const [selectedItems, setSelectedItems] = useState<{ [id: string]: boolean }>({
    sausage: true,
    bacon: true,
    blackpudding: true,
    egg: true,
    beans: true,
    mushrooms: true,
    tomato: true,
    friedbread: true
  });

  const toggleItem = (id: string) => {
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeComponents = AVAILABLE_COMPONENTS.filter(c => selectedItems[c.id]);
  const maxCookTime = Math.max(...activeComponents.map(c => c.cookTime), 0);

  return (
    <div className="bg-white text-stone-900 p-6 sm:p-8 rounded-xl shadow-2xl border border-stone-200 my-8">
      <div className="border-b border-stone-200 pb-6 mb-8">
        <span className="text-xs uppercase font-semibold text-amber-600 tracking-widest block mb-1">INTERACTIVE CULINARY TOOL</span>
        <h1 className="text-3xl font-serif font-bold text-stone-900">Build Your Custom Fry-Up & Timing Schedule</h1>
        <p className="text-sm text-stone-600 mt-2">
          Select your plate components, set the number of diners, and get an exact synchronized cooking schedule so everything lands hot at the exact same moment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Component Selection Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-amber-600 mb-2">1. Number of Diners</label>
            <div className="flex items-center gap-3">
              {[1, 2, 4, 6, 8].map(num => (
                <button
                  key={num}
                  onClick={() => setDiners(num)}
                  className={`px-4 py-2 rounded font-bold text-sm transition ${
                    diners === num ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {num} {num === 1 ? 'Diner' : 'Diners'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-amber-600 mb-2">2. Choose Plate Items</label>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {AVAILABLE_COMPONENTS.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition ${
                    selectedItems[item.id]
                      ? 'bg-amber-50 border-amber-500 text-amber-900'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="font-semibold text-sm">{item.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                    {item.cookTime} mins
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plate Preview & Ingredients */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xs font-semibold uppercase text-amber-600 mb-3">3. Consolidated Ingredient List ({diners} {diners === 1 ? 'Diner' : 'Diners'})</h2>
            <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-2 text-sm text-stone-700">
              {activeComponents.map(comp => {
                const nutrition = nutritionForPlateComponent(comp.id);
                const values = nutrition ? formatPer100gLine(nutrition.entry) : '';
                return (
                  <div key={comp.id} className="border-b border-stone-200 pb-1">
                    <div className="flex justify-between">
                      <span>{comp.name}</span>
                      <span className="font-mono text-amber-600 font-bold">{comp.defaultQty * diners} {comp.unit}</span>
                    </div>
                    {values && (
                      <div className="text-xs text-stone-500 font-mono">
                        {values}
                        {nutrition?.entry.dataType && (
                          <span className="text-stone-400"> · FDC {nutrition.entry.fdcId} ({nutrition.entry.dataType})</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {activeComponents.length === 0 && <p className="text-stone-500 italic">No items selected.</p>}
            </div>
            <p className="mt-3 text-xs text-stone-500">
              Where shown, values are per-100 g reference figures for the raw ingredient, matched to{' '}
              <a href={FDC_ATTRIBUTION.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-700">
                {FDC_ATTRIBUTION.text}
              </a>
              , not a per-serving analysis of your plate. Components without values are not yet verified against
              FoodData Central, so no numbers are shown rather than estimates.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase text-amber-600 mb-2">Equipment Needed</h3>
            <ul className="text-xs text-stone-600 list-disc list-inside space-y-1">
              <li>Heavy 30cm Cast Iron Skillet or Frying Pan</li>
              <li>Small Saucepan for Baked Beans</li>
              <li>Warming Baking Tray (Oven set to 100°C)</li>
              <li>Tongs & Slotted Spatula</li>
            </ul>
          </div>
        </div>

        {/* Synchronized Timeline */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase text-amber-600 mb-3">4. Synchronized Cook Schedule</h3>
            <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-4">
              <p className="text-xs text-stone-600">Total Active Cooking Window: <strong className="text-amber-600">{maxCookTime} Minutes</strong></p>
              
              <div className="space-y-3 relative border-l-2 border-amber-300 pl-4 text-xs">
                {activeComponents
                  .sort((a, b) => b.cookTime - a.cookTime)
                  .map(comp => {
                    const offset = maxCookTime - comp.cookTime;
                    return (
                      <div key={comp.id} className="space-y-1">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-amber-600 font-bold">T-{maxCookTime - offset} Mins</span>
                          <span className="text-stone-600">{comp.cookTime} min cook</span>
                        </div>
                        <p className="text-stone-800 font-semibold">{comp.name}</p>
                        <p className="text-stone-600 text-[11px]">
                          {offset === 0 ? "Start first in medium skillet." : `Add to pan at T-${maxCookTime - offset} minutes.`}
                        </p>
                      </div>
                    );
                  })}
                <div className="pt-2 border-t border-stone-200">
                  <span className="text-amber-600 font-mono font-bold">T-0 Mins: SERVE IMMEDIATELY!</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg transition text-center block"
          >
            Print This Plate Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
