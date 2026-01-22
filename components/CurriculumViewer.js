'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, BookOpen, CheckCircle, Clock, PlayCircle, FileText, Video } from 'lucide-react';

export default function CurriculumViewer({ 
  courseId, 
  userRole = 'student', // 'student' or 'tutor'
  showProgress = true // Whether to show completion status
}) {
  const [curriculum, setCurriculum] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [completedSessions, setCompletedSessions] = useState(new Set());
  const [sessionNotes, setSessionNotes] = useState({}); // Store notes/recordings per session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCurriculum();
      if (showProgress) {
        fetchProgress();
      }
    }
  }, [courseId]);

  const fetchCurriculum = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/curriculum`);
      const data = await response.json();
      
      if (data.success && data.curriculum) {
        setCurriculum(data.curriculum);
        
        // Auto-expand first module
        if (data.curriculum.length > 0) {
          setExpandedModules({ [data.curriculum[0].id]: true });
        }
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const email = sessionStorage.getItem('userEmail');
      
      // FIXED: Get user ID first, then fetch sessions (using existing profile API)
      const usersResponse = await fetch(`/api/users/profile?email=${encodeURIComponent(email)}`);
      const userData = await usersResponse.json();
      
      if (!userData.success) {
        console.error('Failed to get user data');
        return;
      }

      const userId = userData.user.id;
      const idParam = userRole === 'tutor' ? 'tutorId' : 'studentId';
      
      // Fetch all sessions for this user and course
      const sessionsResponse = await fetch(`/api/sessions?${idParam}=${userId}`);
      const sessionsData = await sessionsResponse.json();
      
      if (sessionsData.success) {
        const completed = new Set();
        const notes = {};
        
        sessionsData.sessions
          .filter(s => s.courseId === courseId)
          .forEach(s => {
            // Mark completed sessions
            if (s.status === 'completed' && s.sessionId) {
              completed.add(s.sessionId);
              
              // Store notes/recording info
              if (s.tutorNotes || s.recordingUrl) {
                notes[s.sessionId] = {
                  notes: s.tutorNotes || '',
                  recordingUrl: s.recordingUrl || null,
                  recordedAt: s.sessionCompletedAt
                };
              }
            }
          });
        
        setCompletedSessions(completed);
        setSessionNotes(notes);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleAllModules = () => {
    const allExpanded = curriculum.every(m => expandedModules[m.id]);
    const newState = {};
    curriculum.forEach(m => {
      newState[m.id] = !allExpanded;
    });
    setExpandedModules(newState);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (curriculum.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 sm:p-12 text-center">
        <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No Curriculum Available</h3>
        <p className="text-sm text-gray-500">
          The curriculum for this course hasn't been created yet.
        </p>
      </div>
    );
  }

  const totalSessions = curriculum.reduce((sum, module) => sum + module.sessions.length, 0);
  const completedCount = completedSessions.size;
  const progressPercentage = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Course Curriculum</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {curriculum.length} {curriculum.length === 1 ? 'module' : 'modules'} • {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'}
            </p>
          </div>
          
          <button
            onClick={toggleAllModules}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors self-start sm:self-auto"
          >
            {curriculum.every(m => expandedModules[m.id]) ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Your Progress</span>
              <span className="font-semibold text-gray-800">{completedCount}/{totalSessions} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">{progressPercentage}%</p>
          </div>
        )}
      </div>

      {/* Modules List */}
      <div className="space-y-3">
        {curriculum.map((module, moduleIndex) => {
          const isExpanded = expandedModules[module.id];
          const moduleSessions = module.sessions || [];
          const moduleCompleted = moduleSessions.filter(s => completedSessions.has(s.id)).length;
          const moduleProgress = moduleSessions.length > 0 
            ? Math.round((moduleCompleted / moduleSessions.length) * 100) 
            : 0;

          return (
            <div
              key={module.id}
              className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors"
              >
                {/* Expand Icon */}
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="text-gray-600" size={20} />
                  ) : (
                    <ChevronRight className="text-gray-600" size={20} />
                  )}
                </div>

                {/* Module Badge */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-3 py-1 rounded-lg text-xs sm:text-sm flex-shrink-0">
                  Module {moduleIndex + 1}
                </div>

                {/* Module Info */}
                <div className="flex-1 text-left min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-1 break-words">
                    {module.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {moduleSessions.length} {moduleSessions.length === 1 ? 'session' : 'sessions'}
                    {showProgress && moduleSessions.length > 0 && (
                      <span className="ml-2">• {moduleProgress}% complete</span>
                    )}
                  </p>
                </div>

                {/* Completion Badge */}
                {showProgress && moduleProgress === 100 && (
                  <div className="flex-shrink-0">
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={14} />
                      <span className="hidden sm:inline">Done</span>
                    </span>
                  </div>
                )}
              </button>

              {/* Module Description (if expanded) */}
              {isExpanded && module.description && (
                <div className="px-4 sm:px-5 pb-3 border-b border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-600">{module.description}</p>
                </div>
              )}

              {/* Sessions List (if expanded) */}
              {isExpanded && (
                <div className="p-3 sm:p-4 bg-gray-50">
                  {moduleSessions.length > 0 ? (
                    <div className="space-y-2">
                      {moduleSessions.map((session, sessionIndex) => {
                        const isCompleted = completedSessions.has(session.id);
                        const hasNotes = sessionNotes[session.id];
                        
                        return (
                          <div
                            key={session.id}
                            className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                              isCompleted
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              {/* Session Number */}
                              <div className={`font-semibold px-2 py-1 rounded text-xs flex-shrink-0 ${
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {sessionIndex + 1}
                              </div>

                              {/* Session Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h5 className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                                    {session.title}
                                  </h5>
                                  
                                  {/* Status Icon */}
                                  {showProgress && (
                                    <div className="flex-shrink-0">
                                      {isCompleted ? (
                                        <CheckCircle className="text-green-600" size={18} />
                                      ) : (
                                        <PlayCircle className="text-gray-400" size={18} />
                                      )}
                                    </div>
                                  )}
                                </div>

                                {session.description && (
                                  <p className="text-xs sm:text-sm text-gray-600 mb-2">{session.description}</p>
                                )}

                                {/* Session Meta */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 mb-2">
                                  {session.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} />
                                      {session.duration}
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <span className="text-green-600 font-medium flex items-center gap-1">
                                      <CheckCircle size={12} />
                                      Completed
                                    </span>
                                  )}
                                </div>

                                {/* NEW: Notes/Recording Section (For Students Only) */}
                                {userRole === 'student' && isCompleted && hasNotes && (
                                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
                                      <FileText size={14} />
                                      Session Materials
                                    </p>
                                    
                                    {hasNotes.notes && (
                                      <div className="mb-2">
                                        <p className="text-xs text-blue-700 font-medium mb-1">Tutor Notes:</p>
                                        <p className="text-xs text-gray-700 bg-white p-2 rounded">
                                          {hasNotes.notes}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {hasNotes.recordingUrl && (
                                      <a
                                        href={hasNotes.recordingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-white px-3 py-2 rounded-lg border border-blue-300 hover:border-blue-400 transition-colors"
                                      >
                                        <Video size={14} />
                                        Watch Recording
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-sm text-gray-500">No sessions in this module yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      {showProgress && (
        <div className="bg-blue-50 rounded-xl border-2 border-blue-100 p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Sessions</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{totalSessions}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Remaining</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{totalSessions - completedCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}