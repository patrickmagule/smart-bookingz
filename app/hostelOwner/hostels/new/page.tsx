'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormStepper } from '@/components/owner/form-stepper';
import { BasicInfoStep } from '@/components/owner/hostel-form/basic-info-step';
import { RoomsBedsStep } from '@/components/owner/hostel-form/rooms-beds-step';
import { PhotosStep } from '@/components/owner/hostel-form/photos-step';
import { PricingStep } from '@/components/owner/hostel-form/pricing-step';
import { ReviewStep } from '@/components/owner/hostel-form/review-step';
import { ChevronLeft } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Rooms & Beds' },
  { id: 3, name: 'Photos' },
  { id: 4, name: 'Pricing' },
  { id: 5, name: 'Review & Submit' },
];

export default function NewHostelPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    area: '',
    distance: '',
    phone: '',
    genderPolicy: 'Mixed',
    description: '',
    facilities: [],
    rooms: [],
    images: [],
    deposit: '',
    otherFees: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateData = (updates: any) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Submitting hostel data:', formData);
    setIsSubmitting(false);
    router.push('/hostelOwner?success=true');
  };

  const handleContinue = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy">Add New Hostel Listing</h1>
          <p className="text-sm text-mist">Complete all steps to submit your listing for admin approval</p>
        </div>
        <Link 
          href="/hostelOwner" 
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-navy"
        >
          <ChevronLeft size={14} />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-12">
        <FormStepper steps={STEPS} currentStep={currentStep} />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 md:p-10">
        {currentStep === 1 && (
          <BasicInfoStep 
            data={formData} 
            updateData={updateData} 
            onContinue={handleContinue} 
          />
        )}
        {currentStep === 2 && (
          <RoomsBedsStep 
            data={formData} 
            updateData={updateData} 
            onContinue={handleContinue} 
            onBack={handleBack} 
          />
        )}
        {currentStep === 3 && (
          <PhotosStep 
            data={formData} 
            updateData={updateData} 
            onContinue={handleContinue} 
            onBack={handleBack} 
          />
        )}
        {currentStep === 4 && (
          <PricingStep 
            data={formData} 
            updateData={updateData} 
            onContinue={handleContinue} 
            onBack={handleBack} 
          />
        )}
        {currentStep === 5 && (
          <ReviewStep 
            data={formData} 
            onSubmit={handleSubmit} 
            onBack={handleBack} 
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
