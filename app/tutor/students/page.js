'use client';

import { useEffect, useState } from 'react';
import { Users, Mail, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TutorStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [pairings, setPairings] = useState([]);

  useEffect(() => {
    fetchPairings();
  }, []);

  const fetchPairings = async () => {
    try {
      const email = sessionStorage.getItem('userEmail');
      const response = await fetch(`/api/tutor/pairings?tutorEmail=${email}`);
      const data = await response.json();
      
      if (data.success) {
        setPairings(data.pairings);
      }
    } catch (error) {
      console.error('Error fetching pairings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (pairingId, response) => {
    try {
      const email = sessionStorage.getItem('userEmail');
      
      // Get tutor ID
      const userResponse = await fetch(`/api/users/profile?email=${email}`);
      const userData = await userResponse.json();
      
      if (!userData.success) {
        alert('Failed to get tutor info');
        return;
      }

      const apiResponse = await fetch('/api/tutor/pairing/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairingId,
          response,
          tutorId: userData.user.id
        })
      });

      const result = await apiResponse.json();

      if (result.success) {
        alert(response === 'accept' ? '✅ Student pairing accepted!' : '❌ Pairing declined');
        fetchPairings(); // Refresh
      } else {
        alert('Failed to respond: ' + result.error);
      }
    } catch (error) {
      console.error('Respond error:', error);
      alert('Error responding to pairing');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  const pendingPairings = pairings.filter(p => p.status === 'pending');
  const activePairings = pairings.filter(p => p.status === 'accepted' || p.status === 'active');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">My Students</h1>
        <p className="text-gray-600">Manage your student pairings</p>
      </div>

      {/* Pending Requests */}
      {pendingPairings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Requests</h2>
          <div className="space-y-4">
            {pendingPairings.map((pairing) => (
              <div key={pairing.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-500 p-3 rounded-full">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{pairing.studentName}</h3>
                      <p className="text-sm text-gray-600">{pairing.studentEmail}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <BookOpen size={14} className="inline mr-1" />
                        {pairing.courseName}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    Requested {new Date(pairing.requestedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleRespond(pairing.id, 'accept')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    ✓ Accept Student
                  </button>
                  <button
                    onClick={() => handleRespond(pairing.id, 'decline')}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    ✗ Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Students */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Students</h2>
        {activePairings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePairings.map((pairing) => (
              <div key={pairing.id} className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-full">
                    <Users className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{pairing.studentName}</h3>
                    <p className="text-sm text-gray-600">{pairing.studentEmail}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    <span>{pairing.courseName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Paired {new Date(pairing.requestedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button 
                    onClick={() => {
                        // Option 1: Navigate to a details page
                        // router.push(`/tutor/students/${pairing.id}`);
                        
                        // Option 2: Show modal with details
                        alert(`Student: ${pairing.studentName}\nEmail: ${pairing.studentEmail}\nCourse: ${pairing.courseName}\nStatus: ${pairing.status}`);
                        
                        // Option 3: Expand inline (implement state toggle)
                    }}
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors"
                    >
                    View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No active students yet</h3>
            <p className="text-gray-500">Students will appear here when you accept pairing requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
