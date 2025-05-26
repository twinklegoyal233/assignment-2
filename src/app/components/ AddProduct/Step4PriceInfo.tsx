'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useAddProductStore } from '../../store/addProductStore';
import { useEffect } from 'react';

// ✅ Enhanced Zod Schema with custom validation
const schema = z.object({
  price: z.string().min(1, 'Price is required').refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: 'Price must be a positive number' }
  ),
  discount: z.string().optional(),
  discountType: z.enum(['%', '$']),
}).refine(
  (data) => {
    const price = parseFloat(data.price);
    const discount = parseFloat(data.discount || '0');
    
    if (isNaN(price) || price <= 0) return true; // Let price validation handle this
    if (isNaN(discount) || discount <= 0) return true; // No discount or invalid discount is fine
    
    if (data.discountType === '%') {
      // Percentage discount should not be more than 100%
      return discount <= 100;
    } else {
      // Flat discount should not be more than or equal to the price
      return discount < price;
    }
  },
  {
    message: 'Discount cannot make the final price zero or negative',
    path: ['discount'], // This will show the error on the discount field
  }
);

type FormData = z.infer<typeof schema>;

export function useStep4Form(defaultValues: {
  price: string;
  discount: string;
  discountType: '%' | '$';
}) {
  return useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange', // Validate on change for better UX
  });
}

export default function Step4PriceInfo({
  form,
}: {
  form: ReturnType<typeof useStep4Form>;
}) {
  const { register, watch, setValue, formState: { errors } } = form;
  const { updateData } = useAddProductStore();

  const price = watch('price');
  const discount = watch('discount');
  const discountType = watch('discountType');

  // Calculate final price for display
  const calculateFinalPrice = () => {
    const priceNum = parseFloat(price) || 0;
    const discountNum = parseFloat(discount || '0') || 0;
    
    if (priceNum <= 0 || discountNum <= 0) return priceNum;
    
    if (discountType === '%') {
      return priceNum - (priceNum * discountNum) / 100;
    } else {
      return priceNum - discountNum;
    }
  };

  const finalPrice = calculateFinalPrice();
  const isDiscounted = parseFloat(discount || '0') > 0;

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
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            ₹
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            {...register('price')}
            className={clsx(
              'border p-2 pl-8 w-full rounded-lg text-sm',
              errors.price && 'border-red-500'
            )}
            placeholder="Enter price"
          />
        </div>
        {errors.price && (
          <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
        )}
      </div>

      {/* Discount */}
      <div>
        <label className="block text-sm mb-1">Discount</label>
        <div className="flex">
          <input
            type="number"
            min="0"
            step="0.01"
            {...register('discount')}
            className={clsx(
              'border p-2 w-full rounded-l-lg text-sm',
              errors.discount && 'border-red-500'
            )}
            placeholder="Enter discount"
          />
          <div className="flex">
            <button
              type="button"
              className={clsx(
                'px-4 py-2 border text-sm',
                discountType === '%'
                  ? 'bg-[#E2E8F0] text-black font-semibold'
                  : 'text-gray-500',
                'border-l-0'
              )}
              onClick={() => setValue('discountType', '%')}
            >
              %
            </button>
            <button
              type="button"
              className={clsx(
                'px-4 py-2 border text-sm',
                discountType === '$'
                  ? 'bg-[#E2E8F0] text-black font-semibold'
                  : 'text-gray-500',
                'border-l-0 rounded-r-lg -ml-[1px]'
              )}
              onClick={() => setValue('discountType', '$')}
            >
              $
            </button>
          </div>
        </div>
        {errors.discount && (
          <p className="text-red-500 text-xs mt-1">{errors.discount.message}</p>
        )}
        
        {/* Discount validation hints */}
        {isDiscounted && parseFloat(price) > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            {discountType === '%' && parseFloat(discount || '0') > 100 && (
              <p className="text-red-500">Percentage discount cannot exceed 100%</p>
            )}
            {discountType === '$' && parseFloat(discount || '0') >= parseFloat(price) && (
              <p className="text-red-500">Flat discount cannot be equal to or greater than the price</p>
            )}
          </div>
        )}
      </div>

      {/* Final Price Preview */}
      {parseFloat(price) > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Price Preview</h3>
          <div className="text-sm">
            <div className="flex justify-between">
              <span>Original Price:</span>
              <span>₹{parseFloat(price).toLocaleString()}</span>
            </div>
            {isDiscounted && (
              <>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>
                    {discountType === '%' ? `${discount}%` : `₹${discount}`}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Final Price:</span>
                  <span className={finalPrice <= 0 ? 'text-red-500' : 'text-green-600'}>
                    ₹{Math.max(0, finalPrice).toLocaleString()}
                  </span>
                </div>
                {finalPrice <= 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    Final price cannot be zero or negative
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}