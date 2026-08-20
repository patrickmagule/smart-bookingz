'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BasicInfoStep } from '@/components/owner/hostel-form/basic-info-step';
import { RoomsBedsStep } from '@/components/owner/hostel-form/rooms-beds-step';
import { PhotosStep } from '@/components/owner/hostel-form/photos-step';
import { PricingStep } from '@/components/owner/hostel-form/pricing-step';
import { ReviewStep } from '@/components/owner/hostel-form/review-step';
import { createHostel } from '@/app/hostelOwner/hostels/new/actions';
import { uploadFiles } from '@/lib/uploadthing/client';

let idCounter = 0;

// Explicit form types to avoid narrow inference (empty arrays become never[] otherwise)
type Bed = { id: number; label: string; price?: string | number };
type Room = { id: number; name: string; type: string; description?: string; amenities?: string[]; beds: Bed[] };
type ImageItem = { file?: File; previewUrl?: string; url?: string; isPrimary?: boolean };

type HostelFormData = {
  name: string;
  address: string;
  area: string;
  city: string;
  distance: string;
  phone: string;
  genderPolicy: string;
  description: string;
  facilities: string[];
  images: ImageItem[];
  rooms: Room[];
  deposit: string;
  otherFees: string;
};

export default function HostelWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<HostelFormData>({
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

  const updateData = (fields: Partial<HostelFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Upload images to UploadThing if they haven't been uploaded yet
      const imagesToUpload = formData.images.filter(img => img.file);
      let uploadedImages = formData.images;

      if (imagesToUpload.length > 0) {
        const filesToUpload = imagesToUpload.map(img => img.file!);
        const uploadRes = await uploadFiles("hostelImages", {
          files: filesToUpload,
        });

        // Map the results back to our images array
        let uploadIdx = 0;
        uploadedImages = formData.images.map(img => {
          if (img.file) {
            const uploadedFile = uploadRes[uploadIdx++];
            return {
              ...img,
              url: uploadedFile.url,
              file: undefined // Clear the file after successful upload
            };
          }
          return img;
        });
      }

      // Build payload matching the server-side CreateHostelPayload shape
      const payload: Parameters<typeof createHostel>[0] = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        area: formData.area,
        city: formData.city,
        genderPolicy: formData.genderPolicy,
        phone: formData.phone,
        deposit: formData.deposit,
        otherFees: formData.otherFees,
        facilities: formData.facilities.length ? formData.facilities : undefined,
        images: uploadedImages.map((img) => ({
          url: img.url || '',
          isPrimary: img.isPrimary
        })),
        rooms: formData.rooms.map((r) => ({
          name: r.name,
          description: r.description,
          price: r.price,
          beds: r.beds.map((b) => ({ label: b.label }))
        }))
      };

      const res = await createHostel(payload);
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