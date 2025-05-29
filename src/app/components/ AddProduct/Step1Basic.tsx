'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProductStore } from '../../store/productStore';
import { useAddProductStore } from '../../store/addProductStore';
import Image from 'next/image';
import { useEffect } from 'react';


const schema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  image : z.string().optional(),
});

export type Step1FormData = z.infer<typeof schema>;

export function useStep1Form(defaultValues: Step1FormData) {
  return useForm<Step1FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });
}

export default function Step1Basic({ form }: { form: ReturnType<typeof useStep1Form> }) {
  const { register, formState: { errors }, watch, setValue, trigger } = form;
  const categories = useProductStore((state) => state.categories);
  const image = useAddProductStore((state) => state.data.image);
  const updateData = useAddProductStore((state) => state.updateData);

  useEffect(() => {
    register('image');
  }, [register]);

   
    useEffect(() => {
      setValue('image', image || '');
      trigger('image');
    }, [setValue, image, trigger]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateData({ image: reader.result }); 
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    updateData({ image: '' });
    setValue('image', ''); // Clear form value
    trigger('image'); // Trigger validation
  };

const categoryValue = watch('category')

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm mb-1">Product name *</label>
        <input {...register('name')} className="border p-2 w-full rounded-lg" placeholder="Enter product name" />
        {errors.name && <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Category *</label>
        <select
          {...register('category')}
          className="border p-2 w-full rounded-lg"
         value={categoryValue}
        >
          <option value="" disabled>Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Brand *</label>
        <input {...register('brand')} className="border p-2 w-full rounded-lg" placeholder="Enter brand" />
        {errors.brand && <p className="text-red-500 text-sm mt-1">{String(errors.brand.message)}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Product Image *</label>
        <div className="w-fit">
          <label
            htmlFor="upload"
            className="cursor-pointer flex gap-2 items-center border border-[#1F8CD0] text-[#1F8CD0] py-2 px-4 rounded-lg font-semibold"
          >
            <Image  alt="upload" src="/upload.svg" width={20} height={20} />
            Upload Image
          </label>
          <input  
            id="upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          {errors.image && <p className="text-red-500 text-sm mt-2">{String(errors.image.message)}</p>}
        </div>

        {image && (
          <div className="mt-4 relative w-40 h-40 border rounded-lg overflow-hidden">
            <Image src={image} alt="Uploaded" fill className="object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-white rounded-full text-black px-2 py-0.5 text-xs shadow"
            >
              ✖
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
