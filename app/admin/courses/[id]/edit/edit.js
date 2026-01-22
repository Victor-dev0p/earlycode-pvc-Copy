'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Upload,
  Plus,
  X
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EditCourseClient() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photoUrl: '',
    price: '',
    durationMonths: '',
    frequencyDaysPerWeek: '',
    sessionLengthHours: '',
    format: 'online',
    award: '',
    status: 'draft',
  });
  const [learningObjectives, setLearningObjectives] = useState(['']);
  const [marketOpportunities, setMarketOpportunities] = useState(['']);
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`);
      const data = await response.json();

      if (data.success) {
        const course = data.course;
        setFormData({
          title: course.title || '',
          description: course.description || '',
          photoUrl: course.photoUrl || '',
          price: course.price || '',
          durationMonths: course.durationMonths || '',
          frequencyDaysPerWeek: course.frequencyDaysPerWeek || '',
          sessionLengthHours: course.sessionLengthHours || '',
          format: course.format || 'online',
          award: course.award || '',
          status: course.status || 'draft',
        });
        setLearningObjectives(course.learningObjectives?.length ? course.learningObjectives : ['']);
        setMarketOpportunities(course.marketOpportunities?.length ? course.marketOpportunities : ['']);
        setFaqs(course.faqs?.length ? course.faqs : [{ question: '', answer: '' }]);
      } else {
        alert('Course not found');
        router.push('/admin/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Error loading course');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.durationMonths || parseInt(formData.durationMonths) <= 0) newErrors.durationMonths = 'Valid duration is required';
    if (!formData.frequencyDaysPerWeek || parseInt(formData.frequencyDaysPerWeek) <= 0 || parseInt(formData.frequencyDaysPerWeek) > 7) {
      newErrors.frequencyDaysPerWeek = 'Frequency must be between 1-7 days';
    }
    if (!formData.sessionLengthHours || parseFloat(formData.sessionLengthHours) <= 0) {
      newErrors.sessionLengthHours = 'Valid session length is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setActiveTab('basic');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          learningObjectives: learningObjectives.filter(obj => obj.trim() !== ''),
          marketOpportunities: marketOpportunities.filter(opp => opp.trim() !== ''),
          faqs: faqs.filter(faq => faq.question.trim() !== '' && faq.answer.trim() !== ''),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Course updated successfully!');
        router.push('/admin/courses');
      } else {
        alert(data.error || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Error updating course');
    } finally {
      setSaving(false);
    }
  };

  const addLearningObjective = () => {
    setLearningObjectives([...learningObjectives, '']);
  };

  const removeLearningObjective = (index) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };

  const updateLearningObjective = (index, value) => {
    const updated = [...learningObjectives];
    updated[index] = value;
    setLearningObjectives(updated);
  };

  const addMarketOpportunity = () => {
    setMarketOpportunities([...marketOpportunities, '']);
  };

  const removeMarketOpportunity = (index) => {
    setMarketOpportunities(marketOpportunities.filter((_, i) => i !== index));
  };

  const updateMarketOpportunity = (index, value) => {
    const updated = [...marketOpportunities];
    updated[index] = value;
    setMarketOpportunities(updated);
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index, field, value) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Course Details' },
    { id: 'objectives', label: 'Learning Objectives' },
    { id: 'faqs', label: 'FAQs' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Edit Course</h1>
            <p className="text-gray-600">Update course information</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm">
        <div className="border-b-2 border-gray-100 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Introduction to Web Development"
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                    errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Provide a detailed description of what students will learn..."
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all resize-none ${
                    errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Image URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="photoUrl"
                    value={formData.photoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
                    <Upload size={20} />
                    Upload
                  </button>
                </div>
                {formData.photoUrl && (
                  <div className="mt-3">
                    <img 
                      src={formData.photoUrl} 
                      alt="Course preview" 
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="50000"
                    min="0"
                    step="1000"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                      errors.price ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Award/Certificate
                </label>
                <input
                  type="text"
                  name="award"
                  value={formData.award}
                  onChange={handleChange}
                  placeholder="e.g., Certificate of Completion in Web Development"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Course Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (Months) *
                  </label>
                  <input
                    type="number"
                    name="durationMonths"
                    value={formData.durationMonths}
                    onChange={handleChange}
                    placeholder="6"
                    min="1"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                      errors.durationMonths ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.durationMonths && (
                    <p className="text-red-500 text-xs mt-1">⚠ {errors.durationMonths}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Days Per Week *
                  </label>
                  <input
                    type="number"
                    name="frequencyDaysPerWeek"
                    value={formData.frequencyDaysPerWeek}
                    onChange={handleChange}
                    placeholder="3"
                    min="1"
                    max="7"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                      errors.frequencyDaysPerWeek ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.frequencyDaysPerWeek && (
                    <p className="text-red-500 text-xs mt-1">⚠ {errors.frequencyDaysPerWeek}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Session Length (Hours) *
                  </label>
                  <input
                    type="number"
                    name="sessionLengthHours"
                    value={formData.sessionLengthHours}
                    onChange={handleChange}
                    placeholder="2"
                    min="0.5"
                    step="0.5"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                      errors.sessionLengthHours ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.sessionLengthHours && (
                    <p className="text-red-500 text-xs mt-1">⚠ {errors.sessionLengthHours}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Format
                </label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>

              {/* Course Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl p-6 border-2 border-blue-100">
                <h3 className="font-bold text-gray-800 mb-4">Course Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Duration:</span>
                    <p className="font-semibold text-gray-800">
                      {formData.durationMonths ? `${formData.durationMonths} months` : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Sessions:</span>
                    <p className="font-semibold text-gray-800">
                      {formData.durationMonths && formData.frequencyDaysPerWeek
                        ? `~${formData.durationMonths * 4 * formData.frequencyDaysPerWeek} sessions`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Weekly Commitment:</span>
                    <p className="font-semibold text-gray-800">
                      {formData.frequencyDaysPerWeek && formData.sessionLengthHours
                        ? `${formData.frequencyDaysPerWeek * formData.sessionLengthHours} hours/week`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Format:</span>
                    <p className="font-semibold text-gray-800 capitalize">
                      {formData.format}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Learning Objectives Tab */}
          {activeTab === 'objectives' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Learning Objectives</h3>
                    <p className="text-sm text-gray-600">What will students learn from this course?</p>
                  </div>
                  <button
                    onClick={addLearningObjective}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Objective
                  </button>
                </div>
                
                <div className="space-y-3">
                  {learningObjectives.map((objective, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => updateLearningObjective(index, e.target.value)}
                        placeholder={`Learning objective ${index + 1}`}
                        className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                      {learningObjectives.length > 1 && (
                        <button
                          onClick={() => removeLearningObjective(index)}
                          className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Market Opportunities</h3>
                    <p className="text-sm text-gray-600">What career opportunities await graduates?</p>
                  </div>
                  <button
                    onClick={addMarketOpportunity}
                    className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Opportunity
                  </button>
                </div>
                
                <div className="space-y-3">
                  {marketOpportunities.map((opportunity, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={opportunity}
                        onChange={(e) => updateMarketOpportunity(index, e.target.value)}
                        placeholder={`Market opportunity ${index + 1}`}
                        className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                      />
                      {marketOpportunities.length > 1 && (
                        <button
                          onClick={() => removeMarketOpportunity(index)}
                          className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h3>
                  <p className="text-sm text-gray-600">Add common questions and answers about this course</p>
                </div>
                <button
                  onClick={addFaq}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add FAQ
                </button>
              </div>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-gray-700">FAQ {index + 1}</h4>
                      {faqs.length > 1 && (
                        <button
                          onClick={() => removeFaq(index)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                        placeholder="Question"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                        placeholder="Answer"
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}