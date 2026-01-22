'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Users } from 'lucide-react';
import TutorCard from '@/components/admin/TutorCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TutorsClient() {
  const router = useRouter();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await fetch('/api/admin/tutors');
      const data = await response.json();
      
      if (data.success) {
        setTutors(data.tutors);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (tutor) => {
    // For now, just show an alert. Later we can create a detailed view page
    alert(`Tutor Details:\n\nEmail: ${tutor.email}\nStatus: ${tutor.tutorStatus}\nPhone: ${tutor.phone}\nLocation: ${tutor.state}, ${tutor.lga}`);
  };

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || tutor.tutorStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: tutors.length,
    pending: tutors.filter(t => t.tutorStatus === 'pending_interview').length,
    scheduled: tutors.filter(t => t.tutorStatus === 'interview_scheduled').length,
    passed: tutors.filter(t => t.tutorStatus === 'passed').length,
    active: tutors.filter(t => t.tutorStatus === 'active').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Tutors Management</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage and monitor all tutors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl border-2 border-gray-100 p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Tutors</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border-2 border-yellow-100 p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-yellow-700 mb-1">Pending</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border-2 border-blue-100 p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-blue-700 mb-1">Scheduled</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-800">{stats.scheduled}</p>
        </div>
        <div className="bg-green-50 rounded-xl border-2 border-green-100 p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-green-700 mb-1">Passed</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-800">{stats.passed}</p>
        </div>
        <div className="bg-purple-50 rounded-xl border-2 border-purple-100 p-3 sm:p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-xs sm:text-sm text-purple-700 mb-1">Active</p>
          <p className="text-2xl sm:text-3xl font-bold text-purple-800">{stats.active}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending_interview">Pending Interview</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tutors Grid */}
      {filteredTutors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center shadow-sm">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No tutors found</h3>
          <p className="text-sm sm:text-base text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter' 
              : 'Tutors will appear here when they register'}
          </p>
        </div>
      )}
    </div>
  );
}