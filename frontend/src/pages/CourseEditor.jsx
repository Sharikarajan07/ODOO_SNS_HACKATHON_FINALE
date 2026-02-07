import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button, Input, Card, Select, Badge } from '../components/ui'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

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
    published: false
  })

  const [lessons, setLessons] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'VIDEO',
    contentUrl: '',
    description: '',
    order: 0,
    duration: 0,
    allowDownload: true
  })

  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ]
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (isEdit) {
      fetchCourse()
    }
  }, [id])

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
        published: courseData.published
      })
      setLessons(courseData.lessons || [])
      setQuiz(courseData.quizzes?.[0] || null)
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

  const addLesson = async () => {
    if (!newLesson.title || !newLesson.contentUrl) {
      toast.warning('Please fill in all required fields')
      return
    }

    try {
      const response = await api.post('/lessons', {
        ...newLesson,
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
        allowDownload: true
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

      setQuiz({
        ...quiz,
        questions: [...(quiz.questions || []), response.data]
      })

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
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/dashboard')}
        >
          <ArrowLeft size={16} className="inline mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-2 px-4 ${activeTab === 'details' ? 'border-b-2 border-primary-600 text-primary-600 font-semibold' : 'text-gray-600'}`}
        >
          Course Details
        </button>
        {isEdit && (
          <>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`pb-2 px-4 ${activeTab === 'lessons' ? 'border-b-2 border-primary-600 text-primary-600 font-semibold' : 'text-gray-600'}`}
            >
              Lessons ({lessons.length})
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`pb-2 px-4 ${activeTab === 'quiz' ? 'border-b-2 border-primary-600 text-primary-600 font-semibold' : 'text-gray-600'}`}
            >
              Quiz {quiz && `(${quiz.questions?.length || 0})`}
            </button>
          </>
        )}
      </div>

      {/* Course Details Tab */}
      {activeTab === 'details' && (
        <Card>
          <Input
            label="Course Title *"
            value={course.title}
            onChange={(e) => setCourse({ ...course, title: e.target.value })}
            placeholder="Introduction to React"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={course.description}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
              placeholder="Course description..."
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            value={course.tags}
            onChange={(e) => setCourse({ ...course, tags: e.target.value })}
            placeholder="react, javascript, frontend"
          />

          <Input
            label="Cover Image URL"
            value={course.image}
            onChange={(e) => setCourse({ ...course, image: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />

          {/* Image Preview */}
          {course.image && (
            <div className="mt-2 mb-4">
              <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={course.image}
                  alt="Course Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Visibility"
              value={course.visibility}
              onChange={(e) => setCourse({ ...course, visibility: e.target.value })}
              options={[
                { value: 'PUBLIC', label: 'Public' },
                { value: 'PRIVATE', label: 'Private' },
                { value: 'RESTRICTED', label: 'Restricted' }
              ]}
            />

            <Select
              label="Access Rule"
              value={course.accessRule}
              onChange={(e) => setCourse({ ...course, accessRule: e.target.value })}
              options={[
                { value: 'FREE', label: 'Free' },
                { value: 'PAID', label: 'Paid' },
                { value: 'INVITE_ONLY', label: 'Invite Only' }
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

          <Button onClick={saveCourse} disabled={loading}>
            <Save size={16} className="inline mr-2" />
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Course'}
          </Button>
        </Card>
      )}

      {/* Lessons Tab */}
      {activeTab === 'lessons' && isEdit && (
        <div className="space-y-6">
          {/* Existing Lessons */}
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <Card key={lesson.id} className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">#{index + 1}</span>
                    <h3 className="font-semibold">{lesson.title}</h3>
                    <Badge variant="primary">{lesson.type}</Badge>
                    {lesson.duration > 0 && <span className="text-xs text-gray-500">({lesson.duration}m)</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                  <a
                    href={lesson.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    {lesson.contentUrl}
                  </a>
                </div>
                <Button
                  variant="danger"
                  onClick={() => deleteLesson(lesson.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </Card>
            ))}
          </div>

          {/* Add New Lesson */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Add New Lesson</h3>
            <Input
              label="Lesson Title *"
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              placeholder="Lesson 1: Introduction"
            />

            <Select
              label="Type *"
              value={newLesson.type}
              onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value })}
              options={[
                { value: 'VIDEO', label: 'Video' },
                { value: 'DOCUMENT', label: 'Document' },
                { value: 'IMAGE', label: 'Image' }
              ]}
            />

            <Input
              label="Content URL *"
              value={newLesson.contentUrl}
              onChange={(e) => setNewLesson({ ...newLesson, contentUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                label="Duration (minutes)"
                type="number"
                value={newLesson.duration}
                onChange={(e) => setNewLesson({ ...newLesson, duration: parseInt(e.target.value) })}
                placeholder="15"
              />
              <div className="flex items-center h-full pt-6">
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"
                placeholder="Lesson description..."
              />
            </div>

            <Button onClick={addLesson}>
              <Plus size={16} className="inline mr-2" />
              Add Lesson
            </Button>
          </Card>
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === 'quiz' && isEdit && (
        <div className="space-y-6">
          {!quiz ? (
            <Card className="text-center py-8">
              <p className="text-gray-600 mb-4">No quiz created yet</p>
              <Button onClick={createQuiz}>Create Quiz</Button>
            </Card>
          ) : (
            <>
              {/* Rewards Configuration */}
              <Card className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Quiz Rewards (Points)</h3>
                <div className="grid grid-cols-4 gap-4">
                  <Input
                    label="1st Attempt"
                    type="number"
                    value={quiz.rewards?.attempt1 || 10}
                    onChange={(e) => setQuiz({
                      ...quiz,
                      rewards: { ...quiz.rewards, attempt1: parseInt(e.target.value) }
                    })}
                  />
                  <Input
                    label="2nd Attempt"
                    type="number"
                    value={quiz.rewards?.attempt2 || 7}
                    onChange={(e) => setQuiz({
                      ...quiz,
                      rewards: { ...quiz.rewards, attempt2: parseInt(e.target.value) }
                    })}
                  />
                  <Input
                    label="3rd Attempt"
                    type="number"
                    value={quiz.rewards?.attempt3 || 5}
                    onChange={(e) => setQuiz({
                      ...quiz,
                      rewards: { ...quiz.rewards, attempt3: parseInt(e.target.value) }
                    })}
                  />
                  <Input
                    label="4th+ Attempt"
                    type="number"
                    value={quiz.rewards?.attempt4 || 3}
                    onChange={(e) => setQuiz({
                      ...quiz,
                      rewards: { ...quiz.rewards, attempt4: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </Card>

              {/* Existing Questions */}
              <div className="space-y-4">
                {quiz.questions?.map((question, index) => (
                  <Card key={question.id}>
                    <h4 className="font-semibold mb-2">
                      Q{index + 1}: {question.questionText}
                    </h4>
                    <div className="space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={option.id}
                          className={`p-2 rounded ${option.isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option.optionText}
                          {option.isCorrect && ' ✓'}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Add New Question */}
              <Card>
                <h3 className="text-lg font-semibold mb-4">Add New Question</h3>
                <Input
                  label="Question Text *"
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  placeholder="What is React?"
                />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options * (check the correct answer)
                  </label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        value={option.optionText}
                        onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  ))}
                  <Button variant="secondary" onClick={addOption} className="mt-2">
                    <Plus size={16} className="inline mr-2" />
                    Add Option
                  </Button>
                </div>

                <Button onClick={addQuestion}>
                  <Plus size={16} className="inline mr-2" />
                  Add Question
                </Button>
              </Card>
            </>
          )}
        </div>
      )}
    </Layout>
  )
}

export default CourseEditor
