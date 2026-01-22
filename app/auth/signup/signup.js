'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, ArrowRight, BookOpen, GraduationCap, Users, Award } from 'lucide-react';

export default function SignupClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        sessionStorage.setItem('userEmail', email);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    
    // 🎯 For guest mode testing: Generate a temporary email
    // In production, this would be replaced with actual Google OAuth
    const tempEmail = `guest_${Date.now()}@test.pvc.com`;
    
    console.log('🔐 Google Auth - Generated temp email:', tempEmail);
    
    setTimeout(() => {
      sessionStorage.setItem('authMethod', 'google');
      sessionStorage.setItem('userEmail', tempEmail); // 🎯 Save the temp email!
      console.log('✅ Saved to sessionStorage:', {
        authMethod: 'google',
        userEmail: tempEmail
      });
      router.push('/auth/continue');
    }, 1500);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative bg-white rounded-3xl border-2 border-blue-100 p-8 max-w-md w-full text-center shadow-xl">
          <div className="mb-6 flex justify-center">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-6 animate-bounce shadow-lg">
              <Mail className="text-white" size={48} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Check your email!</h2>
          <p className="text-gray-600 mb-2">We've sent a magic link to</p>
          <p className="text-blue-600 font-semibold mb-6 break-all">{email}</p>
          <p className="text-sm text-gray-500">Click the link in the email to continue your registration.</p>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="animate-spin text-blue-500" size={16} />
            <span>Waiting for confirmation...</span>
          </div>

          <button
            onClick={() => setEmailSent(false)}
            className="mt-6 text-sm text-blue-600 hover:text-blue-700 underline transition-colors font-medium"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Floating Education Icons */}
      <div className="absolute top-20 left-10 animate-float">
        <BookOpen className="text-blue-200" size={60} />
      </div>
      <div className="absolute bottom-20 right-10 animate-float-delayed">
        <GraduationCap className="text-orange-200" size={70} />
      </div>
      <div className="absolute top-40 right-20 animate-float-slow">
        <Award className="text-blue-300" size={50} />
      </div>

      <div className="relative z-10 max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Marketing Content */}
        <div className="hidden md:block space-y-6">
          <div className="inline-block">
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              <GraduationCap size={20} />
              <span>PVC - Private Virtual Class</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-800 leading-tight">
            Learn at Your Own Pace with
            <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent"> Expert Tutors</span>
          </h1>
          
          <p className="text-gray-600 text-lg">
            Join thousands of students achieving their learning goals through personalized one-on-one virtual sessions.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Personalized Pairing</h3>
                <p className="text-sm text-gray-600">Get matched with expert tutors tailored to your learning style</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-orange-100 p-3 rounded-lg">
                <BookOpen className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Structured Curriculum</h3>
                <p className="text-sm text-gray-600">Follow proven learning paths designed by education experts</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Award className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Earn Certificates</h3>
                <p className="text-sm text-gray-600">Receive recognized certifications upon course completion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="bg-white rounded-3xl border-2 border-blue-100 p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-orange-500 p-3 rounded-2xl shadow-lg">
                <GraduationCap className="text-white" size={40} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Start Learning Today</h2>
            <p className="text-gray-600">Create your account and unlock your potential</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
              <span className="font-semibold">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50 group"
            >
              {loading ? (
                <Loader2 className="animate-spin text-blue-600" size={20} />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">or continue with email</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailAuth()}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              
              <button
                onClick={handleEmailAuth}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 group"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Get Started</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => router.push('/auth/login')}
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Sign in
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(-10deg); }
          50% { transform: translateY(-25px) rotate(-10deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(15deg); }
          50% { transform: translateY(-15px) rotate(15deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}