import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, Layers, Star, Edit, BarChart, Trash2, CheckCircle, User } from 'lucide-react'
import { Button, Badge, Card } from '../components/ui'

const CourseCard = ({ course, viewMode = 'grid', isAdmin = false, onDelete, onTogglePublish }) => {
    const navigate = useNavigate()
    const [imgError, setImgError] = useState(false)

    const calculateTotalDuration = (course) => {
        const minutes = course.lessons?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0
        if (minutes < 60) return `${minutes}m`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }

    // --- GRID VIEW ---
    if (viewMode === 'grid') {
        return (
            <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative flex flex-col h-full">
                {/* Image & Overlay */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                    {!imgError && course.image ? (
                        <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                            <BookOpen size={48} />
                        </div>
                    )}

                    {/* Status Badge (Admin only) */}
                    {isAdmin && (
                        <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border ${course.published
                                ? 'bg-emerald-500/90 text-white border-emerald-400'
                                : 'bg-amber-400/90 text-white border-amber-300'
                                }`}>
                                {course.published ? 'Active' : 'Draft'}
                            </span>
                        </div>
                    )}

                    {/* Overlay Action */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 backdrop-blur-[2px]">
                        {isAdmin ? (
                            <>
                                <button
                                    onClick={() => navigate(`/admin/course/${course.id}/edit`)}
                                    className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform shadow-lg"
                                    title="Edit"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => navigate(`/admin/reporting/${course.id}`)}
                                    className="p-2 bg-white rounded-full text-indigo-600 hover:scale-110 transition-transform shadow-lg"
                                    title="Analytics"
                                >
                                    <BarChart size={20} />
                                </button>
                            </>
                        ) : (
                            <Button
                                onClick={() => navigate(`/course/${course.id}`)}
                                className="rounded-full bg-white text-indigo-600 hover:bg-white/90 border-none shadow-lg"
                            >
                                View Course
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {course.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                            {course.description || 'No description provided.'}
                        </p>

                        {/* Tags */}
                        {course.tags && course.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {course.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs py-0 px-2">{tag}</Badge>
                                ))}
                                {course.tags.length > 3 && (
                                    <span className="text-xs text-gray-400 self-center">+{course.tags.length - 3}</span>
                                )}
                            </div>
                        )}

                        {/* Metadata Row */}
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mb-4 p-3 bg-gray-50/50 rounded-lg">
                            <span className="flex items-center"><Clock size={12} className="mr-1" /> {calculateTotalDuration(course)}</span>
                            <span className="flex items-center"><Layers size={12} className="mr-1" /> {course.lessonCount || 0} Lessons</span>
                            <span className="flex items-center text-yellow-500"><Star size={12} className="mr-1 fill-current" /> {course.averageRating?.toFixed(1) || '0.0'}</span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex -space-x-2">
                            {[...Array(Math.min(3, course.enrollmentCount || 0))].map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] overflow-hidden">
                                    <User size={12} className="text-gray-400" />
                                </div>
                            ))}
                            {(course.enrollmentCount || 0) > 0 &&
                                <span className="text-xs text-gray-500 pl-3 self-center">
                                    {course.enrollmentCount} Student{course.enrollmentCount !== 1 ? 's' : ''}
                                </span>
                            }
                        </div>

                        {isAdmin && (
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onTogglePublish(course)}
                                    title={course.published ? "Unpublish" : "Publish"}
                                    className={`p-1.5 rounded hover:bg-gray-100 ${course.published ? 'text-green-600' : 'text-gray-400'}`}
                                >
                                    <CheckCircle size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(course.id)}
                                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // --- LIST VIEW ---
    return (
        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-0">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {!imgError && course.image ? (
                        <img
                            src={course.image}
                            className="w-full h-full object-cover"
                            alt={course.title}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <BookOpen size={20} />
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{course.lessonCount || 0} Lessons</span>
                        <span>•</span>
                        <span>{course.enrollmentCount || 0} Enrolled</span>
                        {isAdmin && (
                            course.published ? (
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Published</span>
                            ) : (
                                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Draft</span>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-3 opacity-50 group-hover:opacity-100 transition-opacity">
                {isAdmin ? (
                    <>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/course/${course.id}/edit`)}>Edit</Button>
                        <button onClick={() => onDelete(course.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                    </>
                ) : (
                    <Button size="sm" onClick={() => navigate(`/course/${course.id}`)}>View</Button>
                )}
            </div>
        </div>
    )
}

export default CourseCard
