'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const email = sessionStorage.getItem('userEmail');
        
        if (!email) {
          router.push('/auth/login');
          return;
        }

        // Verify user is admin
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          router.push('/auth/signup');
          return;
        }

        const userData = querySnapshot.docs[0].data();
        
        if (userData.role !== 'admin') {
          // Not an admin, redirect to appropriate dashboard
          router.push('/dashboard');
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error('Admin access check error:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={48} />
          <p className="text-gray-600 font-medium mt-4">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}