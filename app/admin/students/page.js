'use client';

import { useEffect, useState } from 'react';
import { Users, Search, Mail, Phone, Calendar, BookOpen } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students');
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Students Management</h1>
        <p className="text-gray-600">Manage all enrolled students</p>
      </div>

      {/* Stats */}
      {/* Stats - UPDATED */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{students.length}</p>
            </div>
            <Users className="text-blue-500" size={40} />
          </div>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Paired</p>
              <p className="text-3xl font-bold text-green-600">
                {students.filter(s => s.pairingStatus === 'accepted').length}
              </p>
            </div>
            <Users className="text-green-500" size={40} />
          </div>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {students.filter(s => s.pairingStatus === 'pending').length}
              </p>
            </div>
            <Users className="text-yellow-500" size={40} />
          </div>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-purple-600">
                {students.filter(s => s.enrollments > 0).length}
              </p>
            </div>
            <Users className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border-2 border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-full">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  {/* FIXED: Now shows actual name from Firebase */}
                  <h3 className="text-xl font-bold text-gray-800">
                    {student.name || student.email?.split('@')[0] || 'Unnamed Student'}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail size={14} />
                      {student.email}
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-1">
                        <Phone size={14} />
                        {student.phone}
                      </div>
                    )}
                    {student.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Joined {new Date(student.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Status badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                student.pairingStatus === 'accepted' || student.pairingStatus === 'active' 
                  ? 'bg-green-100 text-green-700' :
                student.pairingStatus === 'pending' 
                  ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {student.pairingStatus === 'accepted' || student.pairingStatus === 'active' 
                  ? 'Paired' :
                student.pairingStatus === 'pending' 
                  ? 'Pending' : 
                'No Enrollment'}
              </span>
            </div>

            {student.enrollments > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <BookOpen size={16} />
                  <span>{student.enrollments} Course(s) Enrolled</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No students found</h3>
          <p className="text-gray-500">Students will appear here when they enroll</p>
        </div>
      )}
    </div>
  );
}
