import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { logout } from "./actions";

export default function Home() {
     const sessionCookie = cookies().get("session");

     return (
          <>
               <h1>Home</h1>
               <h2>{`Cookie: ${sessionCookie}`}</h2>
               <Link href="/login">Log in</Link>
               <form action={logout}>
                    <button type="submit">Log out</button>
               </form>
          </>
     );
}
