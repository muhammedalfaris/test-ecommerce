import { cookies } from 'next/headers';
import Link from 'next/link';
import { getUserFromToken } from '@/lib/token';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  let user = null;
  let isAuthenticated = false;

  if (token) {
    try {
      user = getUserFromToken(token);
      isAuthenticated = true;
    } catch (error) {
      isAuthenticated = false;
    }
  }

  return <NavbarClient user={user} isAuthenticated={isAuthenticated} />;
}