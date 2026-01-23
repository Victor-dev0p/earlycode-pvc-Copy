'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// ✅ FIX: Separate component that uses useSearchParams
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyAndProceed = async () => {
      try {
        // Check if user already exists in Firestore
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        // Store email in session
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('authMethod', 'email');
        
        setStatus('success');
        
        if (!querySnapshot.empty) {
          // User exists - redirect to dashboard based on role
          const userData = querySnapshot.docs[0].data();
          const role = userData.role || 'student';
          
          setMessage('Welcome back! Redirecting to your dashboard...');
          
          setTimeout(() => {
            router.push('/dashboard'); // Will redirect based on role in dashboard
          }, 1500);
        } else {
          // New user - go to continue page
          setMessage('Email verified! Complete your profile to get started.');
          
          setTimeout(() => {
            router.push('/auth/continue');
          }, 1500);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      }
    };

    verifyAndProceed();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-blue-100 p-8 max-w-md w-full text-center shadow-xl">
        {status === 'verifying' && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="bg-blue-100 p-6 rounded-full animate-pulse">
                <Loader2 className="animate-spin text-blue-600" size={48} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Verifying...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="bg-green-100 p-6 rounded-full animate-bounce">
                <CheckCircle className="text-green-600" size={48} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Verified! ✓</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="animate-spin text-blue-500" size={16} />
              <span>Redirecting you now...</span>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="bg-red-100 p-6 rounded-full">
                <XCircle className="text-red-600" size={48} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/auth/signup')}
              className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
            >
              Back to Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ✅ FIX: Wrap in Suspense boundary
export default function VerifyClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border-2 border-blue-100 p-8 max-w-md w-full text-center shadow-xl">
          <div className="mb-6 flex justify-center">
            <div className="bg-blue-100 p-6 rounded-full animate-pulse">
              <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}