'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Calendar, 
  Users, 
  Send
} from 'lucide-react';
import InterviewSlotCard from '@/components/admin/InterviewSlotCard';
import InterviewBookingCard from './booking-card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  CreateSlotModal, 
  AddMeetLinkModal, 
  UpdateStatusModal, 
  SendOnboardingModal 
} from '@/components/admin/InterviewModal';

export default function InterviewsClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [processing, setProcessing] = useState(false);

  // Modal states
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [showSendOnboarding, setShowSendOnboarding] = useState(false);
  const [showAddMeetLink, setShowAddMeetLink] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);

  // Form states
  const [newSlot, setNewSlot] = useState({ date: '', capacity: 10 });
  const [onboardingLink, setOnboardingLink] = useState('');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [meetLink, setMeetLink] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [interviewStatus, setInterviewStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const view = activeTab === 'bookings' ? 'bookings' : 'slots';
      const response = await fetch(`/api/admin/interviews?view=${view}`);
      const data = await response.json();
      
      if (data.success) {
        if (activeTab === 'bookings') {
          setBookings(data.bookings || []);
        } else {
          setSlots(data.slots || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async () => {
    if (!newSlot.date || !newSlot.capacity) {
      alert('Please fill all fields');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Interview slot created successfully!');
        setShowCreateSlot(false);
        setNewSlot({ date: '', capacity: 10 });
        fetchData();
      } else {
        alert(data.error || 'Failed to create slot');
      }
    } catch (error) {
      console.error('Error creating slot:', error);
      alert('Error creating slot');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this slot? All bookings will be cancelled.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/interviews/${slotId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Slot deleted successfully');
        fetchData();
      } else {
        alert('Failed to delete slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Error deleting slot');
    }
  };

  const handleAddMeetLink = async () => {
    if (!meetLink || !selectedInterview) {
      alert('Please enter a valid Google Meet link');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/interviews/create-meet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: selectedInterview.id,
          googleMeetLink: meetLink,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Google Meet link added successfully!');
        setShowAddMeetLink(false);
        setSelectedInterview(null);
        setMeetLink('');
        fetchData();
      } else {
        alert(data.error || 'Failed to add Google Meet link');
      }
    } catch (error) {
      console.error('Error adding meet link:', error);
      alert('Error adding Google Meet link');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMeetLink = async (interviewId) => {
    if (!confirm('Send Google Meet link to tutor?')) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/interviews/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Google Meet link sent successfully!');
        fetchData();
      } else {
        alert(data.error || 'Failed to send link');
      }
    } catch (error) {
      console.error('Error sending link:', error);
      alert('Error sending link');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!interviewStatus) {
      alert('Please select a status');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/interviews/${selectedInterview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: interviewStatus,
          interviewNotes: interviewNotes || '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Interview status updated successfully!');
        setShowUpdateStatus(false);
        setSelectedInterview(null);
        setInterviewStatus('');
        setInterviewNotes('');
        fetchData();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendOnboarding = async () => {
    if (!onboardingLink) {
      alert('Please enter an onboarding link');
      return;
    }

    if (!confirm('Send onboarding emails to all passed tutors?')) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/interviews/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingLink }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Onboarding emails sent to ${data.count} tutor(s)!`);
        setShowSendOnboarding(false);
        setOnboardingLink('');
        fetchData();
      } else {
        alert(data.error || 'Failed to send onboarding');
      }
    } catch (error) {
      console.error('Error sending onboarding:', error);
      alert('Error sending onboarding');
    } finally {
      setProcessing(false);
    }
  };

  const passedCount = bookings.filter(b => b.status === 'passed' && !b.onboardingSent).length;

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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Interview Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage interview slots and tutor interviews</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
          {passedCount > 0 && (
            <button
              onClick={() => setShowSendOnboarding(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base whitespace-nowrap"
            >
              <Send size={18} />
              <span>Send Onboarding ({passedCount})</span>
            </button>
          )}
          <button
            onClick={() => setShowCreateSlot(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Create Slot</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm mb-6">
        <div className="flex border-b-2 border-gray-100">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 px-2 sm:px-4 lg:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm lg:text-base min-w-0 ${
              activeTab === 'bookings'
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Users size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
              <span className="truncate">Bookings ({bookings.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`flex-1 px-2 sm:px-4 lg:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm lg:text-base min-w-0 ${
              activeTab === 'slots'
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Calendar size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
              <span className="truncate">Slots ({slots.length})</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'bookings' ? (
        <div className="space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <InterviewBookingCard
                key={booking.id}
                booking={booking}
                onAddMeetLink={(interview) => {
                  setSelectedInterview(interview);
                  setMeetLink('');
                  setShowAddMeetLink(true);
                }}
                onSendMeetLink={handleSendMeetLink}
                onUpdateStatus={(interview, status) => {
                  setSelectedInterview(interview);
                  setInterviewStatus(status);
                  setInterviewNotes('');
                  setShowUpdateStatus(true);
                }}
                processing={processing}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No interview bookings yet</h3>
              <p className="text-sm sm:text-base text-gray-500">Bookings will appear here when tutors schedule interviews</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {slots.length > 0 ? (
            slots.map((slot) => (
              <InterviewSlotCard 
                key={slot.id} 
                slot={slot} 
                onDelete={handleDeleteSlot}
              />
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No interview slots created</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">Create slots to allow tutors to book interviews</p>
              <button
                onClick={() => setShowCreateSlot(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <Plus size={20} />
                Create First Slot
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateSlotModal
        show={showCreateSlot}
        onClose={() => setShowCreateSlot(false)}
        newSlot={newSlot}
        setNewSlot={setNewSlot}
        onSubmit={handleCreateSlot}
        processing={processing}
      />

      <AddMeetLinkModal
        show={showAddMeetLink}
        onClose={() => {
          setShowAddMeetLink(false);
          setSelectedInterview(null);
          setMeetLink('');
        }}
        meetLink={meetLink}
        setMeetLink={setMeetLink}
        onSubmit={handleAddMeetLink}
        processing={processing}
      />

      <UpdateStatusModal
        show={showUpdateStatus}
        onClose={() => {
          setShowUpdateStatus(false);
          setSelectedInterview(null);
          setInterviewStatus('');
          setInterviewNotes('');
        }}
        interviewStatus={interviewStatus}
        setInterviewStatus={setInterviewStatus}
        interviewNotes={interviewNotes}
        setInterviewNotes={setInterviewNotes}
        onSubmit={handleUpdateStatus}
        processing={processing}
      />

      <SendOnboardingModal
        show={showSendOnboarding}
        onClose={() => {
          setShowSendOnboarding(false);
          setOnboardingLink('');
        }}
        onboardingLink={onboardingLink}
        setOnboardingLink={setOnboardingLink}
        passedCount={passedCount}
        onSubmit={handleSendOnboarding}
        processing={processing}
      />
    </div>
  );
}