'use client';

import { X, Calendar, Video, FileText, Send, Loader2 } from 'lucide-react';

export function CreateSlotModal({ show, onClose, newSlot, setNewSlot, onSubmit, processing }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-blue-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-2">Create Interview Slot</h3>
              <p className="text-blue-50 text-sm">Set up a new interview slot</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Interview Date & Time
            </label>
            <input
              type="datetime-local"
              value={newSlot.date}
              onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Capacity
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 10"
              value={newSlot.capacity}
              onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={processing}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating...
                </>
              ) : (
                'Create Slot'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddMeetLinkModal({ show, onClose, meetLink, setMeetLink, onSubmit, processing }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-purple-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-2">Add Google Meet Link</h3>
              <p className="text-purple-50 text-sm">Enter the interview meeting link</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Video size={16} className="inline mr-2" />
              Google Meet URL
            </label>
            <input
              type="url"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={processing}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Adding...
                </>
              ) : (
                'Add Link'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UpdateStatusModal({ 
  show, 
  onClose, 
  interviewStatus, 
  setInterviewStatus, 
  interviewNotes, 
  setInterviewNotes, 
  onSubmit, 
  processing 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-blue-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-2">Update Interview Status</h3>
              <p className="text-blue-50 text-sm">Mark interview result</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={interviewStatus}
              onChange={(e) => setInterviewStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900"
            >
              <option value="">Select status</option>
              <option value="completed">Completed</option>
              <option value="passed">Passed ✅</option>
              <option value="failed">Failed ❌</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Notes (Optional)
            </label>
            <textarea
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Add any notes about the interview..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={processing || !interviewStatus}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SendOnboardingModal({ 
  show, 
  onClose, 
  onboardingLink, 
  setOnboardingLink, 
  passedCount, 
  onSubmit, 
  processing 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-green-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-2">Send Onboarding</h3>
              <p className="text-green-50 text-sm">Send to {passedCount} passed tutor(s)</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Send size={16} className="inline mr-2" />
              Onboarding Link
            </label>
            <input
              type="url"
              placeholder="https://your-onboarding-portal.com"
              value={onboardingLink}
              onChange={(e) => setOnboardingLink(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-800">
              This will send onboarding emails to all tutors who have passed their interviews.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={processing || !onboardingLink}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending...
                </>
              ) : (
                `Send to ${passedCount}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}