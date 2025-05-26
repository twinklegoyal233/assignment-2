'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useAddProductStore } from '../../store/addProductStore';
import { useEffect } from 'react';

// ✅ Zod Schema
const schema = z.object({
  price: z.string().min(1, 'Price is required'),
  discount: z.string().optional(),
  discountType: z.enum(['%', '$']),
});

type FormData = z.infer<typeof schema>;

export function useStep4Form(defaultValues: {
  price: string;
  discount: string;
  discountType: '%' | '$';
}) {
  return useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });
}

export default function Step4PriceInfo({ form }: { form: ReturnType<typeof useStep4Form> }) {
  const { register, watch, setValue, formState: { errors } } = form;
  const { updateData } = useAddProductStore();

  const price = watch('price');
  const discount = watch('discount');
  const discountType = watch('discountType');

  // Sync with global store
  useEffect(() => {
    updateData({
      priceInr: parseFloat(price) || 0,
      discount: {
        method: discountType === '$' ? 'flat' : 'pct',
        value: parseFloat(discount || '') || 0,
      },
    });
  }, [price, discount, discountType, updateData]);

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold">Price Info</h2>

      {/* Price */}
      <div>
        <label className="block text-sm mb-1">Price *</label>
        <div className="relative">
          <input
            type="number"
            {...register('price')}
            className={clsx(
              'border p-2 pl-8 w-full rounded-lg text-sm',
              errors.price && 'border-red-500'
            )}
            placeholder="Enter price"
          />
        </div>
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
      </div>

      {/* Discount */}
      <div>
        <label className="block text-sm mb-1">Discount</label>
        <div className="flex">
          <input
            type="number"
            {...register('discount')}
            className="border p-2 w-full rounded-l-lg text-sm"
            placeholder="Enter discount"
          />
          <div className="flex">
            <button
              type="button"
              className={clsx(
                'px-4 py-2 border text-sm',
                discountType === '%' ? 'bg-[#E2E8F0] text-black font-semibold' : 'text-gray-500',
                'border-l-0 rounded-r-lg'
              )}
              onClick={() => setValue('discountType', '%')}
            >
              %
            </button>
            <button
              type="button"
              className={clsx(
                'px-4 py-2 border text-sm',
                discountType === '$' ? 'bg-[#E2E8F0] text-black font-semibold' : 'text-gray-500',
                'border-l-0 rounded-r-lg -ml-[1px]'
              )}
              onClick={() => setValue('discountType', '$')}
            >
              $
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
