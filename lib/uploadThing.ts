// lib/uploadthing.ts
// Typed client helpers bound to your FileRouter. These render the actual
// upload UI in the browser; the file bytes go straight to UploadThing —
// only the returned URL ever touches your database.

import { generateUploadButton, generateUploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();