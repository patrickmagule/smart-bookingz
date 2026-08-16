'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormStepper } from '@/components/owner/form-stepper';
import { BasicInfoStep } from '@/components/owner/hostel-form/basic-info-step';
import { RoomsBedsStep } from '@/components/owner/hostel-form/rooms-beds-step';
import { PhotosStep } from '@/components/owner/hostel-form/photos-step';
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
  });

  const updateData = (updates: any) => {
    setFormData((prev) => ({ ...prev, ...updates }));
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
        {currentStep >= 4 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-xl font-bold text-navy">Step {currentStep} Coming Soon</h2>
            <p className="mt-2 text-mist italic">Working on Pricing and Review steps...</p>
            <button
              onClick={handleBack}
              className="mt-6 text-sm font-bold text-navy hover:underline"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
