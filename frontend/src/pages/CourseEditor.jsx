import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save, ArrowLeft, Paperclip, Share2, Eye, Users, Edit } from 'lucide-react'
import Layout from '../components/Layout'
import { Button, Input, Card, Badge, Select } from '../components/ui'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

const CourseEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const toast = useToast()

  const [course, setCourse] = useState({
    title: '',
    description: '',
    tags: '',
    image: '',
    visibility: 'PUBLIC',
    accessRule: 'FREE',
    price: 0,
    website: '',
    responsibleId: '',
    published: false
  })

  const [lessons, setLessons] = useState([])
  const [quiz, setQuiz] = useState(null)

  // Lesson Editor State
  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'VIDEO',
    contentUrl: '',
    description: '',
    order: 0,
    duration: 0,
    allowDownload: true,
    attachments: []
  })

  // Attachments state for new lesson
  const [newAttachment, setNewAttachment] = useState({ type: 'LINK', url: '' })

  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ]
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [showAttendeesModal, setShowAttendeesModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [attendeeEmail, setAttendeeEmail] = useState('')
  const [users, setUsers] = useState([])
  const [activeLessonTab, setActiveLessonTab] = useState('content')

  useEffect(() => {
    if (isEdit) {
      fetchCourse()
    }
    fetchUsers()
  }, [id])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users', error)
      // toast.error('Failed to load users') // Optional: suppress if not critical
    }
  }

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${id}`)
      const courseData = response.data
      setCourse({
        title: courseData.title,
        description: courseData.description || '',
        tags: courseData.tags?.join(', ') || '',
        image: courseData.image || '',
        visibility: courseData.visibility,
        accessRule: courseData.accessRule,
        price: courseData.price || 0,
        website: courseData.website || '',
        responsibleId: courseData.responsibleId || '',
        published: courseData.published
      })
      setLessons(courseData.lessons || [])
      setQuiz(courseData.quizzes?.[0] || null)
      // Ensure specific fields exist
      if (courseData.quizzes?.[0]) {
        const q = courseData.quizzes[0]
        setQuiz({
          ...q,
          questions: q.questions || []
        })
      }
    } catch (error) {
      console.error('Failed to fetch course', error)
      toast.error('Failed to load course details')
    }
  }

  const saveCourse = async () => {
    setLoading(true)
    try {
      const data = {
        ...course,
        tags: course.tags.split(',').map(t => t.trim()).filter(Boolean)
      }

      if (isEdit) {
        await api.put(`/courses/${id}`, data)
        toast.success('Course updated successfully')
        navigate('/admin/dashboard')
      } else {
        const response = await api.post('/courses', data)
        toast.success('Course created successfully')
        navigate(`/admin/course/${response.data.id}/edit`)
      }
    } catch (error) {
      toast.error('Failed to save course')
    } finally {
      setLoading(false)
    }
  }

  const handlePublishToggle = async (e) => {
    const newPublishedState = e.target.checked
    setCourse({ ...course, published: newPublishedState })
    
    if (isEdit) {
      try {
        await api.put(`/courses/${id}`, {
          ...course,
          published: newPublishedState,
          tags: course.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
        toast.success(newPublishedState ? 'Course published!' : 'Course unpublished')
      } catch (error) {
        toast.error('Failed to update course status')
        // Revert the change
        setCourse({ ...course, published: !newPublishedState })
      }
    }
  }

  const handleFileUpload = async (e, type = 'course') => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (type === 'course') {
        setCourse({ ...course, image: response.data.url })
      } else if (type === 'lesson') {
        setNewLesson({ ...newLesson, contentUrl: response.data.url })
      } else if (type === 'attachment') {
        // Determine type based on extension or default to FILE
        setNewAttachment({ ...newAttachment, url: response.data.url, type: 'FILE' })
      }
      toast.success('File uploaded successfully')
    } catch (error) {
      console.error('Upload failed', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  // Attachment Handlers
  const addAttachment = () => {
    if (!newAttachment.url) return;
    setNewLesson({
      ...newLesson,
      attachments: [...(newLesson.attachments || []), { ...newAttachment }]
    })
    setNewAttachment({ type: 'LINK', url: '' })
  }

  const removeAttachment = (idx) => {
    const updated = [...(newLesson.attachments || [])]
    updated.splice(idx, 1)
    setNewLesson({ ...newLesson, attachments: updated })
  }

  const addLesson = async () => {
    if (!newLesson.title || !newLesson.contentUrl) {
      toast.warning('Please fill in all required fields')
      return
    }

    // Clean YouTube URL (remove params like ?si=...)
    let cleanedUrl = newLesson.contentUrl
    if (cleanedUrl.includes('youtube') || cleanedUrl.includes('youtu.be')) {
      cleanedUrl = cleanedUrl.replace(/(\?|&)si=[^&]*/, '')
    }

    try {
      const response = await api.post('/lessons', {
        ...newLesson,
        contentUrl: cleanedUrl,
        courseId: id,
        order: lessons.length
      })
      setLessons([...lessons, response.data])
      setNewLesson({
        title: '',
        type: 'VIDEO',
        contentUrl: '',
        description: '',
        order: 0,
        duration: 0,
        allowDownload: true,
        attachments: []
      })
      toast.success('Lesson added successfully')
    } catch (error) {
      toast.error('Failed to add lesson')
    }
  }

  const deleteLesson = async (lessonId) => {
    if (!confirm('Delete this lesson?')) return

    try {
      await api.delete(`/lessons/${lessonId}`)
      setLessons(lessons.filter(l => l.id !== lessonId))
      toast.success('Lesson deleted')
    } catch (error) {
      toast.error('Failed to delete lesson')
    }
  }

  // Header Actions
  const handlePreview = () => {
    window.open(`/course/${id}`, '_blank')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/course/${id}`)
    toast.success('Course link copied to clipboard')
  }

  // Attendees Handler
  const handleAddAttendees = () => {
    setShowAttendeesModal(true)
  }

  const sendInvite = async () => {
    if (!attendeeEmail) return
    try {
      // Mock API call for invite
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success(`Invitation sent to ${attendeeEmail}`)
      setAttendeeEmail('')
      setShowAttendeesModal(false)
    } catch (e) {
      toast.error('Failed to send invitation')
    }
  }

  const createQuiz = async () => {
    try {
      const response = await api.post('/quizzes', {
        courseId: id,
        title: 'Course Quiz',
        questions: [],
        rewards: { attempt1: 10, attempt2: 7, attempt3: 5, attempt4: 3 }
      })
      setQuiz(response.data)
      toast.success('Quiz created')
    } catch (error) {
      toast.error('Failed to create quiz')
    }
  }

  const addQuestion = async () => {
    if (!newQuestion.questionText || !quiz) {
      toast.warning('Please provide question text')
      return
    }

    const validOptions = newQuestion.options.filter(o => o.optionText.trim())
    if (validOptions.length < 2) {
      toast.warning('Please provide at least 2 options')
      return
    }

    try {
      const response = await api.post(`/quizzes/${quiz.id}/questions`, {
        questionText: newQuestion.questionText,
        options: validOptions
      })

      setQuiz(prev => ({
        ...prev,
        questions: [...(prev.questions || []), response.data]
      }))

      setNewQuestion({
        questionText: '',
        options: [
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false }
        ]
      })
      toast.success('Question added')
    } catch (error) {
      toast.error('Failed to add question')
    }
  }

  const updateOption = (index, field, value) => {
    const updated = [...newQuestion.options]
    updated[index] = { ...updated[index], [field]: value }
    setNewQuestion({ ...newQuestion, options: updated })
  }

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, { optionText: '', isCorrect: false }]
    })
  }

  return (
    <Layout title={isEdit ? 'Edit Course' : 'New Course'}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowLeft size={16} className="inline mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Configure Course' : 'New Course'}</h1>

          {isEdit && (
            <div className="flex items-center gap-2 ml-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={course.published}
                  onChange={handlePublishToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-2 text-sm font-medium text-gray-900">{course.published ? 'Published' : 'Draft'}</span>
              </label>
            </div>
          )}
        </div>

        {isEdit && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleAddAttendees}>
              <Users size={16} className="mr-2 inline" /> Add Attendees
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <Eye size={16} className="mr-2 inline" /> Website
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b overflow-x-auto">
        {['content', 'description', 'options', 'quiz'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-6 capitalize whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'content' ? `Content (${lessons.length})` :
              tab === 'quiz' ? `Quiz ${quiz ? `(${quiz.questions?.length || 0})` : ''}` : tab}
          </button>
        ))}
      </div>

      {/* --- TAB 1: CONTENT --- */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
            <Button onClick={() => setShowLessonModal(true)}>
              <Plus size={16} className="mr-2" /> Add Content
            </Button>
          </div>

          {lessons.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">No content added yet.</p>
              <Button variant="outline" onClick={() => setShowLessonModal(true)}>Add your first lesson</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="secondary" className="text-[10px] py-0 px-2">{lesson.type}</Badge>
                        {lesson.duration > 0 && <span>{lesson.duration}m</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-indigo-600">
                      <Edit size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600" onClick={() => deleteLesson(lesson.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: DESCRIPTION --- */}
      {activeTab === 'description' && (
        <Card>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Description
            </label>
            <textarea
              value={course.description}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Detailed course description..."
            />
          </div>
        </Card>
      )}

      {/* --- TAB 3: OPTIONS --- */}
      {activeTab === 'options' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input
              label="Course Title"
              value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
            />

            <Input
              label="Tags (comma-separated)"
              value={course.tags}
              onChange={(e) => setCourse({ ...course, tags: e.target.value })}
              placeholder="react, javascript"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
            <div className="flex gap-4 items-start">
              <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                {course.image ? (
                  <img src={course.image} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('course-image-upload').click()} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload New'}
                  </Button>
                  <input id="course-image-upload" type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'course')} />
                </div>
                <Input
                  placeholder="Or paste image URL"
                  value={course.image}
                  onChange={(e) => setCourse({ ...course, image: e.target.value })}
                />
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Visibility"
              value={course.visibility}
              onChange={(e) => setCourse({ ...course, visibility: e.target.value })}
              options={[
                { value: 'PUBLIC', label: 'Everyone' },
                { value: 'RESTRICTED', label: 'Signed In' },
                { value: 'PRIVATE', label: 'Private (Hidden)' } // Keeping Private as extra option
              ]}
            />
            <Select
              label="Access Rule"
              value={course.accessRule}
              onChange={(e) => setCourse({ ...course, accessRule: e.target.value })}
              options={[
                { value: 'FREE', label: 'Open' },
                { value: 'PAID', label: 'On Payment' },
                { value: 'INVITE_ONLY', label: 'On Invitation' }
              ]}
            />
          </div>

          {course.accessRule === 'PAID' && (
            <div className="mt-4">
              <Input
                label="Price ($)"
                type="number"
                value={course.price}
                onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) })}
                placeholder="29.99"
              />
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Website URL"
              value={course.website}
              onChange={(e) => setCourse({ ...course, website: e.target.value })}
              placeholder="https://mycourse.com"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Admin / Responsible</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={course.responsibleId}
                onChange={(e) => setCourse({ ...course, responsibleId: e.target.value })}
              >
                <option value="">Select Responsible Person...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={saveCourse} disabled={loading}>
              <Save size={16} className="inline mr-2" />
              Save Configuration
            </Button>
          </div>
        </Card>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h3 className="text-lg font-bold">Edit Lesson Content</h3>
              <button onClick={() => setShowLessonModal(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            {/* Lesson Modal Tabs */}
            <div className="flex border-b px-6">
              {['content', 'description', 'attachments'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveLessonTab(tab)}
                  className={`py-3 px-4 capitalize font-medium text-sm ${activeLessonTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-6">

              {/* --- TAB 1: CONTENT --- */}
              {activeLessonTab === 'content' && (
                <div className="space-y-4">
                  <Input
                    label="Lesson Title *"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                    placeholder="e.g. Introduction to Hooks"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Lesson Type"
                      value={newLesson.type}
                      onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value })}
                      options={[
                        { value: 'VIDEO', label: 'Video' },
                        { value: 'DOCUMENT', label: 'Document' },
                        { value: 'IMAGE', label: 'Image' }
                      ]}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Responsible (Optional)</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newLesson.responsibleId || ''}
                        onChange={(e) => setNewLesson({ ...newLesson, responsibleId: e.target.value })}
                      >
                        <option value="">Select Person...</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {newLesson.type === 'VIDEO' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                      <Input
                        label="Video URL (YouTube/Drive) *"
                        value={newLesson.contentUrl}
                        onChange={(e) => setNewLesson({ ...newLesson, contentUrl: e.target.value })}
                        placeholder="https://youtube.com/..."
                      />
                      <Input
                        label="Duration (minutes)"
                        type="number"
                        value={newLesson.duration}
                        onChange={(e) => setNewLesson({ ...newLesson, duration: parseInt(e.target.value) })}
                      />
                    </div>
                  )}

                  {(newLesson.type === 'DOCUMENT' || newLesson.type === 'IMAGE') && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload {newLesson.type === 'IMAGE' ? 'Image' : 'Document'} *
                        </label>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => document.getElementById('lesson-modal-upload').click()} disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Choose File'}
                          </Button>
                          <input id="lesson-modal-upload" type="file" hidden accept={newLesson.type === 'IMAGE' ? "image/*" : ".pdf,.doc,.docx"} onChange={(e) => handleFileUpload(e, 'lesson')} />
                          <div className="flex-1 p-2 bg-white border rounded text-sm text-gray-600 truncate">
                            {newLesson.contentUrl || 'No file selected'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newLesson.allowDownload}
                            onChange={(e) => setNewLesson({ ...newLesson, allowDownload: e.target.checked })}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <span className="text-gray-700">Allow Download</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB 2: DESCRIPTION --- */}
              {activeLessonTab === 'description' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Description
                  </label>
                  <textarea
                    value={newLesson.description}
                    onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-48 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter a detailed description for this lesson..."
                  />
                </div>
              )}

              {/* --- TAB 3: ATTACHMENTS --- */}
              {activeLessonTab === 'attachments' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold mb-3 flex items-center"><Paperclip size={14} className="mr-2" /> Additional Resources</h4>

                    <div className="flex gap-2 mb-4">
                      <select
                        className="border rounded px-2 py-1 bg-white"
                        value={newAttachment.type}
                        onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value })}
                      >
                        <option value="LINK">Link (URL)</option>
                        <option value="FILE">File Upload</option>
                      </select>

                      {newAttachment.type === 'LINK' ? (
                        <Input
                          placeholder="https://..."
                          value={newAttachment.url}
                          onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                          className="flex-1"
                        />
                      ) : (
                        <div className="flex-1 flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => document.getElementById('att-upload').click()} disabled={uploading}>
                            Upload
                          </Button>
                          <input id="att-upload" type="file" hidden onChange={(e) => handleFileUpload(e, 'attachment')} />
                          <div className="flex-1 p-2 bg-white border rounded text-sm text-gray-600 truncate">
                            {newAttachment.url || 'No file'}
                          </div>
                        </div>
                      )}

                      <Button size="sm" onClick={addAttachment} variant="secondary">Add</Button>
                    </div>

                    <div className="space-y-2">
                      {(newLesson.attachments || []).map((att, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Badge variant="outline" className="text-[10px]">{att.type}</Badge>
                            <span className="truncate">{att.url}</span>
                          </div>
                          <button onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-700 ml-2">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {(newLesson.attachments || []).length === 0 && (
                        <p className="text-gray-400 text-center text-sm italic">No attachments added</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t mt-4">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowLessonModal(false)}>Cancel</Button>
                  <Button onClick={() => { addLesson(); setShowLessonModal(false); }}>Save Lesson</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Tab */}
      {
        activeTab === 'quiz' && isEdit && (
          <div className="space-y-6">
            {!quiz ? (
              <Card className="text-center py-8">
                <p className="text-gray-600 mb-4">No quiz created yet</p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => navigate(`/admin/course/${id}/quiz/new`)}>
                    <Plus size={16} className="inline mr-2" />
                    Create Quiz via Builder
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between group">
                <div>
                  <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                  <div className="text-sm text-gray-500">
                    {quiz.questions?.length || 0} Questions • Rewards Configured
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate(`/admin/course/${id}/quiz/${quiz.id}`)}>
                    Edit in Builder
                  </Button>
                  <Button variant="danger" onClick={async () => {
                    if (!confirm('Delete this quiz?')) return;
                    try {
                      await api.delete(`/quizzes/${quiz.id}`)
                      setQuiz(null)
                      toast.success('Quiz deleted')
                    } catch (e) {
                      toast.error('Failed to delete quiz')
                    }
                  }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Attendees Modal */}
      {showAttendeesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 animate-fade-in-up">
            <h3 className="text-lg font-bold mb-4">Invite Learner</h3>
            <Input
              label="Email Address"
              value={attendeeEmail}
              onChange={(e) => setAttendeeEmail(e.target.value)}
              placeholder="learner@example.com"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAttendeesModal(false)}>Cancel</Button>
              <Button onClick={sendInvite}>Send Invite</Button>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  )
}

export default CourseEditor
