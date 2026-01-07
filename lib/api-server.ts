import { cookies } from 'next/headers';

const API_BASE_URL = 'https://skilltestnextjs.evidam.zybotechlab.com';

export async function getNewProductsServer() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/new-products/`, {
    headers,
    cache: 'no-store', 
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}

