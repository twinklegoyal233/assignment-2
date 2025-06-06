'use client';

import { useAddProductStore } from '../../store/addProductStore';
import Step1Basic, { useStep1Form } from './Step1Basic';
import Link from 'next/link';
import Step2Variants, { useStep2Form } from './Step2Variants';
import Step3Combinations, { useStep3Form } from './Step3Combinations';
import Step4PriceInfo, { useStep4Form } from './Step4PriceInfo';
import { v4 as uuid } from 'uuid';
import { saveDraft, getDraft } from '../../utils /draftStorage';
import { useRouter } from 'next/navigation';
import { useProductStore } from '../../store/productStore';
import { useEffect, useState } from 'react';

// Helper function to validate final price
const validateFinalPrice = (price: number, discount?: { method: 'flat' | 'pct'; value: number }) => {
  if (!discount || discount.value <= 0) return true;
  
  let finalPrice = price;
  
  if (discount.method === 'pct') {
    if (discount.value > 100) return false;
    finalPrice = price - (price * discount.value) / 100;
  } else {
    if (discount.value >= price) return false;
    finalPrice = price - discount.value;
  }
  
  return finalPrice > 0;
};

export default function AddProduct() {
  const { step, data, updateData, setStep, reset } = useAddProductStore();
  const { categories, addProduct } = useProductStore();
  const [showResume, setShowResume] = useState(false);
  const [priceError, setPriceError] = useState<string>('');
  const [isCheckingDraft, setIsCheckingDraft] = useState(true); // Start as TRUE
  const router = useRouter();
  
  useEffect(() => {
    const checkDraft = async () => {
      const draft = await getDraft();
      if (draft && Object.keys(draft).length > 0) {
        setShowResume(true);
      }
      setIsCheckingDraft(false)
    };
    checkDraft();
  }, []);


  const handleResume = async () => {
    const draft = await getDraft();
    if (draft) {
      updateData(draft);         
      form.reset({
        name: draft.name || '',
        category: draft.category || '',
        brand: draft.brand || '',
        image: draft.image || '',
      });                       
  
      form2.reset({
        variants:
          Array.isArray(draft.variants) && draft.variants.length > 0
            ? draft.variants
            :[
              { name: 'Size', values: ['M', 'L'] },
              { name: 'Color', values: ['Black', 'Red'] },
            ]
      });
      
      form3.reset({
        combinations: draft.combinations || {},
      });

      form4.reset({
        price: draft.priceInr?.toString() || '',
        discount: draft.discount?.value?.toString() || '',
        discountType: draft.discount?.method === 'flat' ? '$' : '%',
      });
      await new Promise(resolve => setTimeout(resolve, 50)); // Brief delay               
      setStep(draft.step || 0);  
    }
    setShowResume(false);
  };

  const handleStartFresh = async () => {
    await saveDraft(null);    
    reset();                   
    setStep(0);               
    setShowResume(false);      
    setPriceError('');
  };

  // Initialize all forms
  const form = useStep1Form({
    name: data.name || '',
    category: data.category || '',
    brand: data.brand || '',
    image: data.image || '',
  });

  const form2 = useStep2Form({
    variants: Array.isArray(data.variants) && data.variants.length > 0
      ? data.variants
      : [
        { name: 'Size', values: ['M', 'L'] },
        { name: 'Color', values: ['Black', 'Red'] },
      ]
  });
  
  const form3 = useStep3Form({
    combinations: data.combinations || {},
  });

  const form4 = useStep4Form({
    price: data.priceInr?.toString() || '',
    discount: data.discount?.value?.toString() || '',
    discountType: data.discount?.method === 'flat' ? '$' : '%',
  });

  if (isCheckingDraft) {
    return null; 
  }

  const handleNext = () => {
    setPriceError(''); 

   
if (step === 0) {
  form.handleSubmit((values) => {
    if (!values.image || values.image.length === 0) {
      form.setError('image', {
        type: 'manual',
        message: 'Product image is required to proceed.',
      });
      return; 
    }

    updateData(values);
    saveDraft({ ...data, ...values, step: 0 });
    setStep(1);
  })();
} else if (step === 1) {
      form2.handleSubmit((values) => {
        updateData(values);
        saveDraft({ ...data, ...values, step: 1 });
        setStep(2);
      })();
    } else if (step === 2) {
      form3.handleSubmit((values) => {
        updateData(values);
        saveDraft({ ...data, ...values, step: 2 });
        setStep(3);
      })();
    } else if (step === 3) {
      form4.handleSubmit(() => {
        // Validate pricing before proceeding
        const price = Number(data.priceInr);
        const discount = data.discount;

        if (price <= 0) {
          setPriceError('Product price must be greater than 0');
          return;
        }

        if (!validateFinalPrice(price, discount)) {
          setPriceError('Invalid discount: Final price cannot be zero or negative');
          return;
        }

        const newProductData = {
          ...data,
          id: uuid(),
          price: price,
          image: data.image || '/fallbackImage.png',
          // Only include discount if it's valid and greater than 0
          discount: discount && discount.value > 0 ? discount : undefined,
        };

        const matchingCategory = categories.find(
          (cat) => cat.id === data.category
        );

        if (matchingCategory) {
          addProduct(matchingCategory.id, newProductData);
          reset();
          setStep(0);
          saveDraft(null);
          router.push('/products');
        } else {
          console.error('Category not found:', data.category);
          setPriceError('Selected category not found');
          return;
        }
      })();
    }
  };

  if (showResume) {
    return (
      <div className="p-6 bg-white rounded shadow max-w-xl mx-auto mt-12">
        <p className="mb-4 font-semibold">Resume your previous draft?</p>
        <div className="flex gap-4">
          <button onClick={handleResume} className="bg-blue-600 text-white px-4 py-2 rounded">Resume</button>
          <button onClick={handleStartFresh} className="bg-gray-300 text-black px-4 py-2 rounded">Start Fresh</button>
        </div>
      </div>
    );
  }

  if (isCheckingDraft) {
    return null
  }

  return (
    <div className="flex flex-col w-full p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Add Product</h1>
        <div className="flex gap-4">
          {step === 0 ? (
            <>
              <Link href="/products">
                <button className="bg-[#E1E7EB] px-12 py-2 font-semibold rounded-lg text-[#1F8CD0]">
                  Cancel
                </button>
              </Link>
              <button
                onClick={handleNext}
                className="bg-[#1F8CD0] text-white px-12 font-semibold rounded-lg py-2"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setPriceError('');
                  setStep(step - 1);
                }}
                className="bg-[#E1E7EB] px-12 py-2 font-semibold rounded-lg text-[#1F8CD0]"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-[#1F8CD0] text-white px-12 font-semibold rounded-lg py-2"
              >
                {step === 3 ? 'Confirm' : 'Next'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Price Error Display */}
      {priceError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {priceError}
        </div>
      )}

      <div className="flex gap-4 mb-6 text-sm">
        <span
          className={`cursor-pointer ${
            step >= 0 ? 'text-[#1F8CD0] font-medium bg-[#DAEDF9] py-1 px-3 rounded-lg' : 'text-[#808080]'
          }`}
        >
          Description
        </span>
        <span>{'>'}</span>
        <span
          className={`cursor-pointer ${
            step >= 1 ? 'text-[#1F8CD0] font-medium bg-[#DAEDF9] py-1 px-3 rounded-lg' : 'text-[#808080]'
          }`}
        >
          Variants
        </span>
        <span>{'>'}</span>
        <span
          className={`cursor-pointer ${
            step >= 2 ? 'text-[#1F8CD0] font-medium bg-[#DAEDF9] py-1 px-3 rounded-lg' : 'text-[#808080]'
          }`}
        >
          Combinations
        </span>
        <span>{'>'}</span>
        <span
          className={`cursor-pointer ${
            step >= 3 ? 'text-[#1F8CD0] font-medium bg-[#DAEDF9] py-1 px-3 rounded-lg' : 'text-[#808080]'
          }`}
        >
          Price Info
        </span>
      </div>

      {/* Form Step */}
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-2xl">
        {step === 0 && <Step1Basic form={form} />}
        {step === 1 && <Step2Variants form={form2} />}
        {step === 2 && <Step3Combinations form={form3} />}
        {step === 3 && <Step4PriceInfo form={form4} />}
      </div>
    </div>
  );
}