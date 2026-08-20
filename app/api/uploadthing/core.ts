// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
    hostelImages: f({ image: { maxFileSize: "16MB", maxFileCount: 10 } })
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