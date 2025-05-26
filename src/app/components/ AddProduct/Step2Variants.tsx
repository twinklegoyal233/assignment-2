'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';


const schema = z.object({
  variants: z.array(
    z.object({
      name: z.string().min(1, 'Option can’t be empty'),
      values: z.array(z.string().min(1, 'Please enter a value')).min(1, 'Add at least one value'),
    })
  ),
});

type VariantForm = z.infer<typeof schema>;

export function useStep2Form(defaultValues: VariantForm) {
  return useForm<VariantForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });
}

export default function Step2Variants({ form }: { form: ReturnType<typeof useStep2Form> }) {
  const { control, register, watch, setValue, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  const [inputValues, setInputValues] = useState<string[]>([]);

  const handleAddOption = () => {
    append({ name: '', values: [] });
    setInputValues((prev) => [...prev, '']);
  };

  const handleInputChange = (val: string, index: number) => {
    const newInputs = [...inputValues];
    newInputs[index] = val;
    setInputValues(newInputs);
  };

  const handleEnter = (index: number) => {
    const values = watch(`variants.${index}.values`) || [];
    const currentInput = inputValues[index]?.trim();

    if (currentInput && !values.includes(currentInput)) {
      const updated = [...values, currentInput];
      setValue(`variants.${index}.values`, updated);
      handleInputChange('', index);
    }
  };

  const handleRemoveTag = (variantIndex: number, valueIndex: number) => {
    const values = watch(`variants.${variantIndex}.values`) || [];
    const updated = values.filter((_, i) => i !== valueIndex);
    setValue(`variants.${variantIndex}.values`, updated);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Variants</h2>

      {fields.length > 0 && (
        <div className="flex gap-2 text-sm">
          <div className="flex-1">Option *</div>
          <div className="flex-1">Values *</div>
        </div>
      )}

      {fields.map((field, index) => {
        const values = watch(`variants.${index}.values`) || [];

        return (
          <div key={field.id} className="flex items-start gap-2">
            {/* Option Input */}
            <div className="flex-1">
              <input
                {...register(`variants.${index}.name`)}
                className="border p-2 w-full rounded-lg"
                placeholder="Option"
              />
              {errors.variants?.[index]?.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.variants[index]?.name?.message}
                </p>
              )}
            </div>

            {/* Value Tags + Input */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 border py-[5px] px-[6px] rounded-lg w-full min-h-[40px]">
                {values.map((val, valIndex) => (
                  <span
                    key={valIndex}
                    className="flex items-center bg-[#EFEFEF] text-sm gap-[10px] px-2 py-1 rounded-md"
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index, valIndex)}
                      className="ml-1 text-black font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  value={inputValues[index] || ''}
                  onChange={(e) => handleInputChange(e.target.value, index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleEnter(index);
                    }
                  }}
                  className="flex-1 border-none rounded-lg outline-none min-w-[80px]"
                  placeholder="Type value and press Enter"
                />
              </div>
              {errors.variants?.[index]?.values && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.variants[index]?.values?.message}
                </p>
              )}
            </div>

       
            <button
              type="button"
              onClick={() => {
                remove(index);
                const updatedInputs = [...inputValues];
                updatedInputs.splice(index, 1);
                setInputValues(updatedInputs);
              }}
              className="text-red-500 p-2 mt-1"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        );
      })}

      {/* Add Option Button */}
      <button
        type="button"
        onClick={handleAddOption}
        className="text-[#1F8CD0] text-sm font-medium"
      >
        <span className="mr-1 text-lg">+</span>
        Add Option
      </button>
    </div>
  );
}
