import { auth } from "@/lib/auth/server";


// your existing auth code below...
const { GET, POST, PUT, DELETE, PATCH } = auth.handler();

export { GET, POST, PUT, DELETE, PATCH };