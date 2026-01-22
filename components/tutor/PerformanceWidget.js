'use client';

import { useEffect, useState } from 'react';
import { Award, TrendingUp, Users } from 'lucide-react';

export default function TutorPerformanceWidget() {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const email = sessionStorage.getItem('userEmail');
      const response = await fetch(`/api/users/profile?email=${email}`);
      const data = await response.json();
      
      if (data.success) {
        setPerformance(data.user);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!performance) return null;

  const tier = performance.tier || performance.pairingTier || 1;
  const score = performance.performanceScore || 0;
  const maxStudents = performance.maxConcurrentStudents || 1;

  const getTierColor = (tier) => {
    if (tier === 3) return 'from-green-500 to-emerald-600';
    if (tier === 2) return 'from-blue-500 to-indigo-600';
    return 'from-orange-500 to-red-600';
  };

  const getTierLabel = (tier) => {
    if (tier === 3) return 'Excellent';
    if (tier === 2) return 'Good';
    return 'Developing';
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`bg-gradient-to-r ${getTierColor(tier)} p-3 rounded-xl`}>
          <Award className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Your Performance</h3>
          <p className="text-xs text-gray-500">Tier {tier} • {getTierLabel(tier)}</p>
        </div>
      </div>

      {/* Performance Score */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Score</span>
          <span className="text-2xl font-bold text-gray-800">{score.toFixed(1)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-gradient-to-r ${getTierColor(tier)} h-2 rounded-full transition-all`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Metrics */}
      {performance.performanceMetrics && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Attendance</p>
            <p className="text-sm font-bold text-blue-700">
              {performance.performanceMetrics.attendance?.toFixed(0)}%
            </p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 font-medium">Assignments</p>
            <p className="text-sm font-bold text-green-700">
              {performance.performanceMetrics.assignments?.toFixed(0)}%
            </p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 font-medium">Ratings</p>
            <p className="text-sm font-bold text-purple-700">
              {performance.performanceMetrics.reviews?.toFixed(0)}%
            </p>
          </div>
        </div>
      )}

      {/* Capacity */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-600" />
          <span className="text-sm text-gray-700">Student Capacity</span>
        </div>
        <span className="text-sm font-bold text-gray-800">
          {performance.currentStudentCount || 0}/{maxStudents}
        </span>
      </div>

      {/* Warning if insufficient data */}
      {performance.performanceMetrics?.hasMinimumData === false && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ Complete 3+ sessions and 1+ assignment to qualify for tier promotion
          </p>
        </div>
      )}
    </div>
  );
}