'use client';

import { useAddProductStore } from '../../store/addProductStore';
import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import clsx from 'clsx';


interface Combination {
  name: string;
  sku: string;
  inStock: boolean;
  quantity: number | null;
}


function generateCombinations(variants: { name: string; values: string[] }[]): Record<string, Combination> {
  if (variants.length === 0) return {};

  const cartesian = (arrays: string[][]): string[][] =>
    arrays.reduce<string[][]>((a, b) => a.flatMap((x) => b.map((y) => [...x, y])), [[]]);

  const valueGroups = variants.map((v) => v.values);
  const combos = cartesian(valueGroups);

  const result: Record<string, Combination> = {};

  combos.forEach((values, i) => {
    result[`key${i}`] = {
      name: values.join('/'),
      sku: '',
      inStock: false,
      quantity: null,
    };
  });

  return result;
}

export default function Step3Combinations() {
  const { data, updateData } = useAddProductStore();
  const [localCombos, setLocalCombos] = useState<Record<string, Combination>>({});

  useEffect(() => {
    if (data.variants && data.variants.length > 0) {
      if (!data.combinations || Object.keys(data.combinations).length === 0) {
        const generated = generateCombinations(data.variants);
        setLocalCombos(generated);
        updateData({ combinations: generated });
      } else {
        setLocalCombos(data.combinations);
      }
    }
  }, [data.variants, data.combinations, updateData]);
  

  const handleUpdate = (key: string, field: keyof Combination, value: string | boolean) => {
    const updated = { ...localCombos };
    if (field === 'quantity') {
      updated[key][field] = value === '' ? null : Number(value);
    } else {
      updated[key][field] = value as never;
      if (field === 'inStock' && value === false) {
        updated[key].quantity = null;
      }
    }
    setLocalCombos(updated);
    updateData({ combinations: updated });
  };

  const isDuplicateSKU = (sku: string, currKey: string): boolean => {
    return Object.entries(localCombos).some(([key, c]) => key !== currKey && c.sku === sku && sku !== '');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Combinations</h2>

      {/* Headers */}
      <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-600">
        <div className="pl-2"> </div>
        <div className="pl-2">SKU *</div>
        <div className="pl-2">In stock</div>
        <div className="pl-2">Quantity</div>
      </div>

      {Object.entries(localCombos).map(([key, combo]) => (
        <div key={key} className="grid grid-cols-4 gap-4 items-start">
          <div className="text-sm text-black pl-2 pt-2">{combo.name}</div>

          {/* SKU */}
          <div>
            <input
              value={combo.sku}
              onChange={(e) => handleUpdate(key, 'sku', e.target.value)}
              className={clsx(
                'border p-2 w-full rounded-lg text-sm',
                (isDuplicateSKU(combo.sku, key) || combo.sku.trim() === '') && 'border-red-500'
              )}
              placeholder="Enter SKU"
            />
            {combo.sku.trim() === '' ? (
              <p className="text-red-500 text-xs mt-1">SKU is required</p>
            ) : isDuplicateSKU(combo.sku, key) ? (
              <p className="text-red-500 text-xs mt-1">Duplicate SKU</p>
            ) : null}
          </div>

          {/* In stock */}
          <div className="pt-2">
            <Switch
              checked={combo.inStock}
              onChange={(val) => handleUpdate(key, 'inStock', val)}
              className={clsx(
                combo.inStock ? 'bg-black' : 'bg-gray-300',
                'relative inline-flex h-6 w-11 items-center rounded-full'
              )}
            >
              <span
                className={clsx(
                  combo.inStock ? 'translate-x-6' : 'translate-x-1',
                  'inline-block h-4 w-4 transform bg-white rounded-full transition'
                )}
              />
            </Switch>
          </div>

          {/* Quantity */}
          <div>
            <input
              type="number"
              value={combo.quantity ?? ''}
              onChange={(e) => handleUpdate(key, 'quantity', e.target.value)}
              className={clsx(
                'border p-2 w-full rounded-lg text-sm',
                !combo.inStock && 'bg-[#E2E8F0]'
              )}
              disabled={!combo.inStock}
              placeholder="0"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
