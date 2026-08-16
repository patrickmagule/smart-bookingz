import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  hostelImage: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async () => {
      const { data } = await auth.getSession();
      if (!data?.user) throw new Error("Unauthorized");
      
      const [user] = await sql`SELECT id, role FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
      if (!user || user.role !== 'OWNER') throw new Error("Only owners can upload images");
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
    
  roomImage: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async () => {
      const { data } = await auth.getSession();
      if (!data?.user) throw new Error("Unauthorized");
      
      const [user] = await sql`SELECT id, role FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
      if (!user || user.role !== 'OWNER') throw new Error("Only owners can upload images");
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
