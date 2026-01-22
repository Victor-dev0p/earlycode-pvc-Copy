'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Save, Plus, X, Loader2, GripVertical, ChevronDown, ChevronRight, BookOpen, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function UnifiedCurriculumPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [curriculum, setCurriculum] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  const fetchCurriculum = async () => {
    try {
      const courseResponse = await fetch(`/api/admin/courses/${courseId}`);
      const courseData = await courseResponse.json();

      if (courseData.success) {
        setCourseTitle(courseData.course.title);
        setCurriculum(courseData.course.curriculum || []);
        
        // Auto-expand all modules in edit mode
        if (courseData.course.curriculum) {
          const expanded = {};
          courseData.course.curriculum.forEach(module => {
            expanded[module.id] = true;
          });
          setExpandedModules(expanded);
        }
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate curriculum
    const hasEmptyModules = curriculum.some(module => !module.title.trim());
    if (hasEmptyModules) {
      alert('Please fill in all module titles');
      return;
    }

    const hasEmptySessions = curriculum.some(module =>
      module.sessions.some(session => !session.title.trim())
    );
    if (hasEmptySessions) {
      alert('Please fill in all session titles');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculum }),
      });

      if (response.ok) {
        alert('Curriculum updated successfully!');
        setEditMode(false);
        fetchCurriculum();
      } else {
        alert('Failed to update curriculum');
      }
    } catch (error) {
      console.error('Error saving curriculum:', error);
      alert('Error saving curriculum');
    } finally {
      setSaving(false);
    }
  };

  // Edit mode functions
  const addModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      title: '',
      description: '',
      order: curriculum.length + 1,
      sessions: [],
    };
    setCurriculum([...curriculum, newModule]);
    setExpandedModules({ ...expandedModules, [newModule.id]: true });
  };

  const updateModule = (moduleId, field, value) => {
    const updated = curriculum.map(module =>
      module.id === moduleId ? { ...module, [field]: value } : module
    );
    setCurriculum(updated);
  };

  const removeModule = (moduleId) => {
    if (confirm('Are you sure you want to delete this module?')) {
      const updated = curriculum.filter(module => module.id !== moduleId);
      setCurriculum(updated);
    }
  };

  const addSession = (moduleId) => {
    const updated = curriculum.map(module => {
      if (module.id === moduleId) {
        const newSession = {
          id: `session-${Date.now()}`,
          title: '',
          description: '',
          order: module.sessions.length + 1,
          duration: '',
        };
        return {
          ...module,
          sessions: [...module.sessions, newSession],
        };
      }
      return module;
    });
    setCurriculum(updated);
  };

  const updateSession = (moduleId, sessionId, field, value) => {
    const updated = curriculum.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          sessions: module.sessions.map(session =>
            session.id === sessionId ? { ...session, [field]: value } : session
          ),
        };
      }
      return module;
    });
    setCurriculum(updated);
  };

  const removeSession = (moduleId, sessionId) => {
    if (confirm('Are you sure you want to delete this session?')) {
      const updated = curriculum.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            sessions: module.sessions.filter(session => session.id !== sessionId),
          };
        }
        return module;
      });
      setCurriculum(updated);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules({
      ...expandedModules,
      [moduleId]: !expandedModules[moduleId],
    });
  };

  const moveModule = (index, direction) => {
    const newCurriculum = [...curriculum];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newCurriculum.length) return;
    
    [newCurriculum[index], newCurriculum[targetIndex]] = [newCurriculum[targetIndex], newCurriculum[index]];
    
    newCurriculum.forEach((module, idx) => {
      module.order = idx + 1;
    });
    
    setCurriculum(newCurriculum);
  };

  const moveSession = (moduleId, sessionIndex, direction) => {
    const updated = curriculum.map(module => {
      if (module.id === moduleId) {
        const newSessions = [...module.sessions];
        const targetIndex = direction === 'up' ? sessionIndex - 1 : sessionIndex + 1;
        
        if (targetIndex < 0 || targetIndex >= newSessions.length) return module;
        
        [newSessions[sessionIndex], newSessions[targetIndex]] = [newSessions[targetIndex], newSessions[sessionIndex]];
        
        newSessions.forEach((session, idx) => {
          session.order = idx + 1;
        });
        
        return { ...module, sessions: newSessions };
      }
      return module;
    });
    setCurriculum(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 truncate">
                {editMode ? 'Build Curriculum' : 'View Curriculum'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">{courseTitle}</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 0 hover:from-blue-600 hover:to-orange-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all flex items-center gap-2 text-sm sm:text-base shadow-lg"
              >
                <Edit size={18} />
                <span className="hidden sm:inline">Edit Curriculum</span>
                <span className="sm:hidden">Edit</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditMode(false);
                    fetchCurriculum();
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || curriculum.length === 0}
                  className="bg-blue-500 0 hover:from-blue-600 hover:to-orange-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* VIEW MODE */}
        {!editMode && (
          <>
            {curriculum.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {curriculum.map((module, moduleIndex) => (
                  <div key={module.id} className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden shadow-sm">
                    <div className="bg-blue-50  border-b-2 border-gray-200 p-4 sm:p-6">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500 text-white font-bold px-3 py-1 rounded-lg text-sm flex-shrink-0">
                          Module {moduleIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 break-words">
                            {module.title}
                          </h3>
                          {module.description && (
                            <p className="text-sm sm:text-base text-gray-600 mt-2">{module.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">
                        Sessions ({module.sessions?.length || 0})
                      </h4>
                      {module.sessions && module.sessions.length > 0 ? (
                        <div className="space-y-3">
                          {module.sessions.map((session, sessionIndex) => (
                            <div key={session.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border-2 border-gray-200">
                              <div className="flex items-start gap-3">
                                <div className="bg-blue-500 text-white font-semibold px-2 py-1 rounded text-xs flex-shrink-0">
                                  {sessionIndex + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base break-words">
                                    {session.title}
                                  </h5>
                                  {session.description && (
                                    <p className="text-xs sm:text-sm text-gray-600 mb-2">{session.description}</p>
                                  )}
                                  {session.duration && (
                                    <p className="text-xs text-gray-500">Duration: {session.duration}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No sessions in this module</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Summary */}
                <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border-2 border-blue-100">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm sm:text-base">Curriculum Summary</h4>
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600 block mb-1">Total Modules:</span>
                      <p className="font-semibold text-gray-800 text-base sm:text-lg">{curriculum.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Total Sessions:</span>
                      <p className="font-semibold text-gray-800 text-base sm:text-lg">
                        {curriculum.reduce((sum, module) => sum + module.sessions.length, 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Avg Sessions/Module:</span>
                      <p className="font-semibold text-gray-800 text-base sm:text-lg">
                        {curriculum.length > 0
                          ? (curriculum.reduce((sum, module) => sum + module.sessions.length, 0) / curriculum.length).toFixed(1)
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
                <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Curriculum Yet</h3>
                <p className="text-gray-500 mb-6">This course doesn't have a curriculum yet. Click Edit to create one.</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-500 hover:from-blue-600 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2 shadow-lg"
                >
                  <Plus size={20} />
                  Create Curriculum
                </button>
              </div>
            )}
          </>
        )}

        {/* EDIT MODE */}
        {editMode && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-6 lg:p-8 shadow-sm">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Course Curriculum</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Build your course structure with modules and sessions</p>
                </div>
                <button
                  onClick={addModule}
                  className="bg-blue-500 hover:from-blue-600 hover:to-yellow-600 text-white font-semibold px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                >
                  <Plus size={18} />
                  Add Module
                </button>
              </div>

              {/* Modules List */}
              {curriculum.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 sm:p-12 text-center">
                  <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                  <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No modules yet</h4>
                  <p className="text-sm text-gray-500 mb-6">Start building your curriculum by adding the first module</p>
                  <button
                    onClick={addModule}
                    className="bg-blue-500 hover:from-blue-600 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2 shadow-lg"
                  >
                    <Plus size={20} />
                    Add First Module
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {curriculum.map((module, moduleIndex) => (
                    <div
                      key={module.id}
                      className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Module Header */}
                      <div className="bg-blue-50  border-b-2 border-gray-200 p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Drag Handle */}
                          <div className="hidden sm:flex flex-col gap-1">
                            <button
                              onClick={() => moveModule(moduleIndex, 'up')}
                              disabled={moduleIndex === 0}
                              className="p-1 hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move up"
                            >
                              <ChevronDown size={16} className="rotate-180" />
                            </button>
                            <GripVertical size={20} className="text-gray-400 cursor-grab" />
                            <button
                              onClick={() => moveModule(moduleIndex, 'down')}
                              disabled={moduleIndex === curriculum.length - 1}
                              className="p-1 hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move down"
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>

                          {/* Module Number */}
                          <div className="bg-blue-500  text-white font-bold px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex-shrink-0">
                            Module {moduleIndex + 1}
                          </div>

                          {/* Module Title Input */}
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                            placeholder="Module title"
                            className="flex-1 px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all font-semibold text-sm sm:text-base min-w-0"
                          />

                          {/* Actions */}
                          <button
                            onClick={() => toggleModule(module.id)}
                            className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0"
                            title={expandedModules[module.id] ? 'Collapse' : 'Expand'}
                          >
                            {expandedModules[module.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>

                          <button
                            onClick={() => removeModule(module.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex-shrink-0"
                            title="Delete module"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Module Content (Expandable) */}
                      {expandedModules[module.id] && (
                        <div className="p-3 sm:p-4 space-y-4">
                          {/* Module Description */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                              Module Description
                            </label>
                            <textarea
                              value={module.description}
                              onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                              placeholder="Brief description of what this module covers..."
                              rows={2}
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none text-sm"
                            />
                          </div>

                          {/* Sessions */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-xs sm:text-sm font-semibold text-gray-700">
                                Sessions ({module.sessions.length})
                              </label>
                              <button
                                onClick={() => addSession(module.id)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded-lg transition-colors flex items-center gap-1 text-xs sm:text-sm"
                              >
                                <Plus size={16} />
                                Add Session
                              </button>
                            </div>

                            {module.sessions.length === 0 ? (
                              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                                <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                                <p className="text-xs sm:text-sm text-gray-500 mb-3">No sessions in this module</p>
                                <button
                                  onClick={() => addSession(module.id)}
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-xs sm:text-sm"
                                >
                                  <Plus size={16} />
                                  Add First Session
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {module.sessions.map((session, sessionIndex) => (
                                  <div
                                    key={session.id}
                                    className="bg-gray-50 rounded-lg border-2 border-gray-200 p-3 sm:p-4"
                                  >
                                    <div className="flex items-start gap-2 sm:gap-3 mb-3">
                                      {/* Session Reorder */}
                                      <div className="hidden sm:flex flex-col gap-1 mt-2">
                                        <button
                                          onClick={() => moveSession(module.id, sessionIndex, 'up')}
                                          disabled={sessionIndex === 0}
                                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                          title="Move up"
                                        >
                                          <ChevronDown size={14} className="rotate-180" />
                                        </button>
                                        <GripVertical size={16} className="text-gray-400 cursor-grab" />
                                        <button
                                          onClick={() => moveSession(module.id, sessionIndex, 'down')}
                                          disabled={sessionIndex === module.sessions.length - 1}
                                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                          title="Move down"
                                        >
                                          <ChevronDown size={14} />
                                        </button>
                                      </div>

                                      {/* Session Number */}
                                      <div className="bg-blue-500 text-white font-semibold px-2 py-1 rounded text-xs mt-2 flex-shrink-0">
                                        {sessionIndex + 1}
                                      </div>

                                      {/* Session Fields */}
                                      <div className="flex-1 space-y-3 min-w-0">
                                        <input
                                          type="text"
                                          value={session.title}
                                          onChange={(e) => updateSession(module.id, session.id, 'title', e.target.value)}
                                          placeholder="Session title"
                                          className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all font-medium text-sm"
                                        />
                                        <textarea
                                          value={session.description}
                                          onChange={(e) => updateSession(module.id, session.id, 'description', e.target.value)}
                                          placeholder="Session description..."
                                          rows={2}
                                          className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all resize-none text-xs sm:text-sm"
                                        />
                                        <input
                                          type="text"
                                          value={session.duration}
                                          onChange={(e) => updateSession(module.id, session.id, 'duration', e.target.value)}
                                          placeholder="Duration (e.g., 2 hours)"
                                          className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all text-xs sm:text-sm"
                                        />
                                      </div>

                                      {/* Delete Session */}
                                      <button
                                        onClick={() => removeSession(module.id, session.id)}
                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors mt-2 flex-shrink-0"
                                        title="Delete session"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {curriculum.length > 0 && (
                <div className="bg-blue-50  rounded-xl p-4 sm:p-6 border-2 border-blue-100">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm sm:text-base">Curriculum Summary</h4>
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600 block mb-1">Total Modules:</span>
                      <p className="font-semibold text-gray-800 text-base sm:text-lg">{curriculum.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Total Sessions:</span>
                      <p className="font-semibold text-gray-800 text-base sm:text-lg">
                        {curriculum.reduce((sum, module) => sum + module.sessions.length, 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Avg Sessions/Module:</span>
                      <p className="font-semibold text-gray-800 text-base sm:text-lg">
                        {curriculum.length > 0
                          ? (curriculum.reduce((sum, module) => sum + module.sessions.length, 0) / curriculum.length).toFixed(1)
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}