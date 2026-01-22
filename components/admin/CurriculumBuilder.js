'use client';

import { useState } from 'react';
import { Plus, X, GripVertical, ChevronDown, ChevronRight, BookOpen, FileText } from 'lucide-react';

export default function CurriculumBuilder({ curriculum, onChange }) {
  const [expandedModules, setExpandedModules] = useState({});

  const addModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      title: '',
      description: '',
      order: curriculum.length + 1,
      sessions: [],
    };
    onChange([...curriculum, newModule]);
    setExpandedModules({ ...expandedModules, [newModule.id]: true });
  };

  const updateModule = (moduleId, field, value) => {
    const updated = curriculum.map(module =>
      module.id === moduleId ? { ...module, [field]: value } : module
    );
    onChange(updated);
  };

  const removeModule = (moduleId) => {
    const updated = curriculum.filter(module => module.id !== moduleId);
    onChange(updated);
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
          resources: [],
        };
        return {
          ...module,
          sessions: [...module.sessions, newSession],
        };
      }
      return module;
    });
    onChange(updated);
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
    onChange(updated);
  };

  const removeSession = (moduleId, sessionId) => {
    const updated = curriculum.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          sessions: module.sessions.filter(session => session.id !== sessionId),
        };
      }
      return module;
    });
    onChange(updated);
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
    
    // Update order numbers
    newCurriculum.forEach((module, idx) => {
      module.order = idx + 1;
    });
    
    onChange(newCurriculum);
  };

  const moveSession = (moduleId, sessionIndex, direction) => {
    const updated = curriculum.map(module => {
      if (module.id === moduleId) {
        const newSessions = [...module.sessions];
        const targetIndex = direction === 'up' ? sessionIndex - 1 : sessionIndex + 1;
        
        if (targetIndex < 0 || targetIndex >= newSessions.length) return module;
        
        [newSessions[sessionIndex], newSessions[targetIndex]] = [newSessions[targetIndex], newSessions[sessionIndex]];
        
        // Update order numbers
        newSessions.forEach((session, idx) => {
          session.order = idx + 1;
        });
        
        return { ...module, sessions: newSessions };
      }
      return module;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Course Curriculum</h3>
          <p className="text-sm text-gray-600">Build your course structure with modules and sessions</p>
        </div>
        <button
          onClick={addModule}
          className="bg-blue-500 hover:from-blue-600 hover:to-yellow-600 text-white font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={18} />
          Add Module
        </button>
      </div>

      {/* Modules List */}
      {curriculum.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No modules yet</h4>
          <p className="text-gray-500 mb-6">Start building your curriculum by adding the first module</p>
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
              <div className="bg-blue-50 border-b-2 border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-1">
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
                  <div className="bg-blue-500 text-white font-bold px-3 py-1 rounded-lg text-sm">
                    Module {moduleIndex + 1}
                  </div>

                  {/* Module Title Input */}
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                    placeholder="Module title (e.g., Introduction to HTML)"
                    className="flex-1 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  />

                  {/* Actions */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title={expandedModules[module.id] ? 'Collapse' : 'Expand'}
                  >
                    {expandedModules[module.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>

                  <button
                    onClick={() => removeModule(module.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    title="Delete module"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Module Content (Expandable) */}
              {expandedModules[module.id] && (
                <div className="p-4 space-y-4">
                  {/* Module Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Module Description
                    </label>
                    <textarea
                      value={module.description}
                      onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                      placeholder="Brief description of what this module covers..."
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {/* Sessions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Sessions ({module.sessions.length})
                      </label>
                      <button
                        onClick={() => addSession(module.id)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded-lg transition-colors flex items-center gap-1 text-sm"
                      >
                        <Plus size={16} />
                        Add Session
                      </button>
                    </div>

                    {module.sessions.length === 0 ? (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-sm text-gray-500 mb-3">No sessions in this module</p>
                        <button
                          onClick={() => addSession(module.id)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm"
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
                            className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              {/* Session Reorder */}
                              <div className="flex flex-col gap-1 mt-2">
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
                              <div className="bg-blue-500 text-white font-semibold px-2 py-1 rounded text-xs mt-2">
                                {sessionIndex + 1}
                              </div>

                              {/* Session Fields */}
                              <div className="flex-1 space-y-3">
                                <input
                                  type="text"
                                  value={session.title}
                                  onChange={(e) => updateSession(module.id, session.id, 'title', e.target.value)}
                                  placeholder="Session title (e.g., Basic HTML Tags)"
                                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
                                />
                                <textarea
                                  value={session.description}
                                  onChange={(e) => updateSession(module.id, session.id, 'description', e.target.value)}
                                  placeholder="Session description..."
                                  rows={2}
                                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all resize-none text-sm"
                                />
                                <input
                                  type="text"
                                  value={session.duration}
                                  onChange={(e) => updateSession(module.id, session.id, 'duration', e.target.value)}
                                  placeholder="Duration (e.g., 2 hours)"
                                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all text-sm"
                                />
                              </div>

                              {/* Delete Session */}
                              <button
                                onClick={() => removeSession(module.id, session.id)}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors mt-2"
                                title="Delete session"
                              >
                                <X size={18} />
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
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-100">
          <h4 className="font-bold text-gray-800 mb-3">Curriculum Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Modules:</span>
              <p className="font-semibold text-gray-800 text-lg">{curriculum.length}</p>
            </div>
            <div>
              <span className="text-gray-600">Total Sessions:</span>
              <p className="font-semibold text-gray-800 text-lg">
                {curriculum.reduce((sum, module) => sum + module.sessions.length, 0)}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Avg Sessions/Module:</span>
              <p className="font-semibold text-gray-800 text-lg">
                {curriculum.length > 0 
                  ? (curriculum.reduce((sum, module) => sum + module.sessions.length, 0) / curriculum.length).toFixed(1)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}