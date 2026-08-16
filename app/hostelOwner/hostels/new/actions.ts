'use server';

import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createHostel(formData: FormData) {
  const { data } = await auth.getSession();
  if (!data?.user) throw new Error("Unauthorized");

  const [user] = await sql`SELECT id, role FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
  if (!user || user.role !== 'OWNER') throw new Error("Forbidden");

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const address = formData.get('address') as string;
  const area = formData.get('area') as string;
  const city = formData.get('city') as string;
  const genderPreference = formData.get('genderPreference') as string;
  
  // Get image URLs from hidden field (comma separated)
  const imageUrlsString = formData.get('imageUrls') as string;
  const imageUrls = imageUrlsString ? imageUrlsString.split(',').filter(Boolean) : [];

  const [hostel] = await sql`
    INSERT INTO hostels (owner_id, name, description, address, area, city, gender_preference, status)
    VALUES (${user.id}, ${name}, ${description}, ${address}, ${area}, ${city}, ${genderPreference}, 'DRAFT')
    RETURNING id
  `;

  if (imageUrls.length > 0) {
    for (let i = 0; i < imageUrls.length; i++) {
      await sql`
        INSERT INTO hostel_images (hostel_id, image_url, is_primary, display_order)
        VALUES (${hostel.id}, ${imageUrls[i]}, ${i === 0}, ${i})
      `;
    }
  }

  revalidatePath('/hostelOwner/hostels');
  redirect(`/hostelOwner/hostels/${hostel.id}`);
}
