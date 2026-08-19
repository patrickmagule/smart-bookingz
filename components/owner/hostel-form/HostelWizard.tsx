'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BasicInfoStep } from './basic-info-step';
import { RoomsBedsStep } from './rooms-beds-step';
import { PhotosStep } from './photos-step';
import { PricingStep } from './pricing-step';
import { ReviewStep } from './review-step';
import { createHostel } from '@/app/hostelOwner/hostels/new/actions';

let idCounter = 0;

export default function HostelWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        area: '',
        city: 'Blantyre', // Default
        distance: '',
        phone: '',
        genderPolicy: 'Mixed',
        description: '',
        facilities: [],
        images: [],
        rooms: [
            {
                id: ++idCounter,
                name: 'Room 1',
                type: 'Single',
                description: '',
                amenities: [],
                beds: [{ id: ++idCounter, label: 'Bed A', price: '' }]
            }
        ],
        deposit: '',
        otherFees: ''
    });

    const updateData = (fields: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...fields }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await createHostel(formData);
            if (res?.hostelId) {
                router.push(`/hostelOwner/hostels/${res.hostelId}`);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message || "An error occurred during submission.");
            } else {
                alert(String(error) || "An error occurred during submission.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            {step === 1 && (
                <BasicInfoStep
                    data={formData}
                    updateData={updateData}
                    onContinue={() => setStep(2)}
                />
            )}
            {step === 2 && (
                <RoomsBedsStep
                    data={formData}
                    updateData={updateData}
                    onBack={() => setStep(1)}
                    onContinue={() => setStep(3)}
                />
            )}
            {step === 3 && (
                <PhotosStep
                    data={formData}
                    updateData={updateData}
                    onBack={() => setStep(2)}
                    onContinue={() => setStep(4)}
                />
            )}
            {step === 4 && (
                <PricingStep
                    data={formData}
                    updateData={updateData}
                    onBack={() => setStep(3)}
                    onContinue={() => setStep(5)}
                />
            )}
            {step === 5 && (
                <ReviewStep
                    data={formData}
                    onBack={() => setStep(4)}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}