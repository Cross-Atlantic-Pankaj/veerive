'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/footer';

export default function AuthenticatedLayout({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const userFromUrl = searchParams.get('user');

    if (tokenFromUrl && userFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      localStorage.setItem('user', decodeURIComponent(userFromUrl));
    }

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    // if (!token || !userData) {
    //   router.push('/login');
    //   return;
    // }
    if(userData){
    setUser(JSON.parse(userData));
    }
  }, [router, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  // if (!user) return null;

  return (
  
       <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Navbar user={user} onLogout={handleLogout} />
      <main className="w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
} 