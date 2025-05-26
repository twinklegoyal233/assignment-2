'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddProductStore } from '../../store/addProductStore';
import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import clsx from 'clsx';

// Zod Schema for combinations
const schema = z.object({
  combinations: z.record(
    z.string(),
    z.object({
      name: z.string(),
      sku: z.string().min(1, 'SKU is required'),
      inStock: z.boolean(),
      quantity: z.number().nullable(),
    }).refine(
      (data) => {
        if (data.inStock) {
          return typeof data.quantity === 'number' && data.quantity > 0;
        }
        return true;
      },
      {
        path: ['quantity'],
        message: 'Quantity must be greater than 0 when in stock',
      }
    )
  ).refine((combinations) => {
    const skus = Object.values(combinations)
      .map(combo => combo.sku.trim())
      .filter(sku => sku !== '');
    const uniqueSkus = new Set(skus);
    return skus.length === uniqueSkus.size;
  }, {
    message: 'All SKUs must be unique',
    path: ['combinations']
  }),
});


export type Step3FormData = z.infer<typeof schema>;

export function useStep3Form(defaultValues: Step3FormData) {
  return useForm<Step3FormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange', // Validate on change for real-time feedback
  });
}

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

export default function Step3Combinations({ form }: { form: ReturnType<typeof useStep3Form> }) {
  const { register, setValue, formState: { errors, touchedFields, isSubmitted }, trigger } = form;
  const { data, updateData } = useAddProductStore();
  const [localCombos, setLocalCombos] = useState<Record<string, Combination>>({});

  useEffect(() => {
    if (data.variants && data.variants.length > 0) {
      if (!data.combinations || Object.keys(data.combinations).length === 0) {
        const generated = generateCombinations(data.variants);
        setLocalCombos(generated);
        setValue('combinations', generated);
        updateData({ combinations: generated });
      } else {
        setLocalCombos(data.combinations);
        setValue('combinations', data.combinations);
      }
    }
  }, [data.variants, data.combinations, setValue, updateData]);

  const handleUpdate = async (key: string, field: keyof Combination, value: string | boolean) => {
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
    setValue('combinations', updated);
    updateData({ combinations: updated });
    
    // Trigger validation for the specific field and overall combinations
    await trigger(['combinations']);
  };

  const isDuplicateSKU = (sku: string, currKey: string): boolean => {
    return Object.entries(localCombos).some(([key, c]) => key !== currKey && c.sku === sku && sku !== '');
  };

  const getFieldError = (key: string, field: keyof Combination) => {
    return errors.combinations?.[key]?.[field]?.message;
  };

  const isFieldTouched = (key: string, field: keyof Combination) => {
    return touchedFields.combinations?.[key]?.[field];
  };

  const shouldShowError = (key: string, field: keyof Combination) => {
    return isFieldTouched(key, field) || isSubmitted;
  };

  const hasGlobalError = () => {
    return errors.combinations && typeof errors.combinations.message === 'string';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Combinations</h2>

      {/* Global error for duplicate SKUs */}
      {hasGlobalError() && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">
            {typeof errors.combinations?.message === 'string' ? errors.combinations.message : 'Please fix the errors below'}
          </p>
        </div>
      )}

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
              {...register(`combinations.${key}.sku`)}
              value={combo.sku}
              onChange={(e) => handleUpdate(key, 'sku', e.target.value)}
              className={clsx(
                'border p-2 w-full rounded-lg text-sm',
                ((getFieldError(key, 'sku') && shouldShowError(key, 'sku')) || 
                 (isDuplicateSKU(combo.sku, key) && combo.sku.trim() !== '') || 
                 (combo.sku.trim() === '' && shouldShowError(key, 'sku'))) && 'border-red-500'
              )}
              placeholder="Enter SKU"
            />
            {getFieldError(key, 'sku') && shouldShowError(key, 'sku') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError(key, 'sku')}</p>
            )}
            {!getFieldError(key, 'sku') && combo.sku.trim() === '' && shouldShowError(key, 'sku') && (
              <p className="text-red-500 text-xs mt-1">SKU is required</p>
            )}
            {!getFieldError(key, 'sku') && combo.sku.trim() !== '' && isDuplicateSKU(combo.sku, key) && (
              <p className="text-red-500 text-xs mt-1">Duplicate SKU</p>
            )}
          </div>

          {/* In stock */}
          <div className="pt-2">
            <Switch
              {...register(`combinations.${key}.inStock`)}
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
              {...register(`combinations.${key}.quantity`, {
                setValueAs: (value) => value === '' ? null : Number(value)
              })}
              type="number"
              value={combo.quantity ?? ''}
              onChange={(e) => handleUpdate(key, 'quantity', e.target.value)}
              className={clsx(
                'border p-2 w-full rounded-lg text-sm',
                !combo.inStock && 'bg-[#E2E8F0]',
                getFieldError(key, 'quantity') && 'border-red-500'
              )}
              disabled={!combo.inStock}
             
            />
            {getFieldError(key, 'quantity') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError(key, 'quantity')}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}