'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function DashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const email = sessionStorage.getItem('userEmail');
        
        if (!email) {
          router.push('/auth/login');
          return;
        }

        // Get user data from Firestore
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          router.push('/auth/signup');
          return;
        }

        const userData = querySnapshot.docs[0].data();
        const role = userData.role || 'student';

        // Redirect based on role
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else if (role === 'tutor') {
          router.push('/tutor/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      } catch (error) {
        console.error('Dashboard redirect error:', error);
        router.push('/auth/login');
      }
    };

    checkUserAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
        <p className="text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );
}