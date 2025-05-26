'use client';

import { useAddProductStore } from '../../store/addProductStore';
import Step1Basic, { useStep1Form } from './Step1Basic';
import Link from 'next/link';
import Step2Variants, { useStep2Form } from './Step2Variants';
import Step3Combinations from './Step3Combinations';
import Step4PriceInfo, { useStep4Form } from './Step4PriceInfo';
import { v4 as uuid } from 'uuid';
import { saveDraft, getDraft } from '../../utils /draftStorage'; // import
import { useRouter } from 'next/navigation'; // ✅
import { useProductStore } from '../../store/productStore';
import { useEffect, useState } from 'react';
export default function AddProduct() {
  const { step, data, updateData, setStep, reset } = useAddProductStore();
  const { categories, addProduct } = useProductStore();
  const [showResume, setShowResume] = useState(false);
  const router = useRouter(); // ✅
  
  useEffect(() => {
    const checkDraft = async () => {
      const draft = await getDraft();
      if (draft && Object.keys(draft).length > 0) {
        setShowResume(true);
      }
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
      });                       
  
      form2.reset({
        variants: draft.variants || [],
      });                         
      setStep(draft.step || 0);    
    }
    setShowResume(false);
  };

  const handleStartFresh = () => {

    setShowResume(false);
  };


  // Initialize the form
  const form = useStep1Form({
    name: data.name || '',
    category: data.category || '',
    brand: data.brand || '',
  });

  const form2 = useStep2Form({
    variants: data.variants || [],
  });

  const form4 = useStep4Form({
    price: data.priceInr?.toString() || '',
    discount: data.discount?.value?.toString() || '',
    discountType: data.discount?.method === 'flat' ? '$' : '%',
  });


  const handleNext = () => {
    if (step === 0) {
      form.handleSubmit((values) => {
        updateData(values);
        saveDraft({ ...data, ...values }); 
        setStep(1);
      })();
    } else if (step === 1) {
      form2.handleSubmit((values) => {
        updateData(values);
        saveDraft({ ...data, ...values }); 
        setStep(2);
      })();
    }else if (step === 2) {
      saveDraft({ ...data }); 
      setStep(3);
    } else if (step === 3) {
  form4.handleSubmit(() => {
    const newProductData = {
      ...data,
      id: uuid(),
      price: Number(data.priceInr),
      image: data.image || '/fallbackImage.png',
    };

    const matchingCategory = categories.find(
      (cat) => cat.id === data.category
    );

    if (matchingCategory) {
      addProduct(matchingCategory.id, newProductData);
    } else {
      console.error('Category not found:', data.category);
      return;
    }

    reset();
    setStep(0);
    saveDraft(null);
    router.push('/products');
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
          onClick={() => setStep(step - 1)}
          className="bg-[#E1E7EB] px-12 py-2 font-semibold rounded-lg text-[#1F8CD0]"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-[#1F8CD0] text-white px-12 font-semibold rounded-lg py-2"
        >
          Next
        </button>
      </>
    )}
  </div>
</div>


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
      {step === 0 && <Step1Basic  form={form} />}

  {step === 1 && <Step2Variants form={form2} />}
{step === 2 && <Step3Combinations  />}

  {step === 3 && <Step4PriceInfo form={form4} />}

</div>

    </div>
  );
}
