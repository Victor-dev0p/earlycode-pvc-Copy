'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, MapPin, Phone, Radio, Check, Users } from 'lucide-react';

const statesAndLGAs = {
  'Lagos': ['Alimosho', 'Ajeromi-Ifelodun', 'Kosofe', 'Mushin', 'Oshodi-Isolo', 'Ojo', 'Ikorodu', 'Surulere', 'Agege', 'Ifako-Ijaiye', 'Somolu', 'Amuwo-Odofin', 'Lagos Mainland', 'Ikeja', 'Eti-Osa', 'Badagry', 'Apapa', 'Lagos Island', 'Epe', 'Ibeju-Lekki'],
  'Abuja': ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council'],
  'Kano': ['Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Tarauni', 'Nassarawa', 'Kumbotso', 'Ungogo'],
  'Rivers': ['Port Harcourt', 'Obio-Akpor', 'Okrika', 'Ogu–Bolo', 'Eleme', 'Tai', 'Gokana', 'Khana'],
  'Oyo': ['Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West'],
  'Kaduna': ['Kaduna North', 'Kaduna South', 'Chikun', 'Zaria', 'Sabon Gari', 'Igabi'],
  'Ogun': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Ijebu Ode', 'Sagamu'],
};

const channelOptions = [
  { value: 'none', label: 'Choose an option' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'google', label: 'Google Search' },
  { value: 'friend', label: 'Friend/Family' },
  { value: 'billboard', label: 'Billboard' },
  { value: 'signage', label: 'Signage' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'other', label: 'Others' },
];

export default function ContinueClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    state: '',
    lga: '',
    phone: '',
    channel: 'none',
    userType: 'student', 
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail');
    const authMethod = sessionStorage.getItem('authMethod');
    
    if (!email && !authMethod) {
      router.push('/auth/signup');
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'state' && { lga: '' })
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
    validateField(e.target.name, formData[e.target.name]);
  };

  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'state' && !value) {
      error = 'Please select your state';
    } else if (name === 'lga' && !value) {
      error = 'Please select your LGA';
    } else if (name === 'phone' && (!value || !/^[0-9]{10,11}$/.test(value))) {
      error = 'Please enter a valid phone number (10-11 digits)';
    } else if (name === 'channel' && value === 'none') {
      error = 'Please tell us how you heard about us';
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleSubmit = async () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setTouched({ state: true, lga: true, phone: true, channel: true });
      return;
    }
    
    setLoading(true);
    
    try {
      const email = sessionStorage.getItem('userEmail');
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        
        // Store role for dashboard redirect
        sessionStorage.setItem('userRole', data.role);
        
        setTimeout(() => {
          sessionStorage.removeItem('userEmail');
          sessionStorage.removeItem('authMethod');
          router.push('/dashboard');
        }, 2000);
      } else {
        setErrors({ submit: data.error || 'Something went wrong' });
      }
    } catch (err) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border-2 border-blue-100 p-12 max-w-md w-full text-center shadow-xl">
          <div className="mb-6 flex justify-center">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-6 animate-bounce shadow-lg">
              <Check className="text-white" size={64} />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome Aboard!</h2>
          <p className="text-gray-600 mb-8">Your account has been successfully created. Get ready for an amazing learning experience!</p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="animate-spin text-blue-500" size={16} />
            <span>Redirecting to dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = Object.values(formData).filter(v => v && v !== 'none').length / 4 * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl border-2 border-blue-100 p-8 md:p-12 max-w-2xl w-full shadow-2xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">Complete Your Profile</h2>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-orange-500 h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-gray-600 mt-3 text-sm">Just a few more details to get you started</p>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
            <span className="font-semibold">⚠</span>
            <span>{errors.submit}</span>
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin size={18} className="text-blue-500" />
              State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            >
              <option value="">Select your state</option>
              {Object.keys(statesAndLGAs).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && touched.state && (
              <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <span>⚠</span> {errors.state}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin size={18} className="text-orange-500" />
              Local Government Area (LGA)
            </label>
            <select
              name="lga"
              value={formData.lga}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!formData.state}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select your LGA</option>
              {formData.state && statesAndLGAs[formData.state]?.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
            {errors.lga && touched.lga && (
              <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <span>⚠</span> {errors.lga}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Phone size={18} className="text-blue-500" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="08012345678"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            {errors.phone && touched.phone && (
              <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <span>⚠</span> {errors.phone}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Radio size={18} className="text-orange-500" />
              How did you hear about us?
            </label>
            <select
              name="channel"
              value={formData.channel}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
            >
              {channelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.channel && touched.channel && (
              <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <span>⚠</span> {errors.channel}
              </span>
            )}
          </div>

          {/* After the channel field, add this */}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users size={18} className="text-purple-500" />
              I want to join as
            </label>
            <select
              name="userType"
              value={formData.userType || 'student'}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="student">Student - I want to learn</option>
              <option value="tutor">Tutor - I want to teach</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 group mt-8"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}