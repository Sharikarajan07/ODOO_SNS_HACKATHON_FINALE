import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, Layers, Star, Edit, BarChart, Trash2, CheckCircle, User, HelpCircle, Eye, Share2 } from 'lucide-react'
import { Button, Badge, Card } from '../components/ui'

const CourseCard = ({ course, enrollment, viewMode = 'grid', isAdmin = false, onDelete, onTogglePublish }) => {
    const navigate = useNavigate()
    const [imgError, setImgError] = useState(false)

    const calculateTotalDuration = (course) => {
        const minutes = course.lessons?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0
        if (minutes < 60) return `${minutes}m`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }

    const getActionButton = () => {
        if (isAdmin) return null;

        // 1. Course is Paid and NOT enrolled (implied by lack of enrollment or enrollment check outside)
        // However, if 'enrollment' prop is passed, we use it. If not passed, we assume not enrolled or handled by parent.

        if (enrollment) {
            // Enrolled
            if (enrollment.progressPercentage > 0) {
                return (
                    <Button
                        onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}`); }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full"
                    >
                        Continue
                    </Button>
                )
            } else {
                return (
                    <Button
                        onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}`); }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full"
                    >
                        Start
                    </Button>
                )
            }
        } else {
            // Not Enrolled
            if (course.accessRule === 'PAID') {
                return (
                    <Button
                        onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}`); }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-full"
                    >
                        Buy Course (${course.price})
                    </Button>
                )
            } else {
                return (
                    <Button
                        onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}`); }}
                        variant="outline"
                        className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-full"
                    >
                        Join Course
                    </Button>
                )
            }
        }
    }

    // --- GRID VIEW ---
    if (viewMode === 'grid') {
        return (
            <div
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative flex flex-col h-full cursor-pointer"
                onClick={() => navigate(isAdmin ? `/admin/course/${course.id}/edit` : `/course/${course.id}`)}
            >
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
                            </div>
                        )}

                        {/* Metadata Row */}
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mb-4 p-3 bg-gray-50/50 rounded-lg">
                            <span className="flex items-center"><Clock size={12} className="mr-1" /> {calculateTotalDuration(course)}</span>
                            <span className="flex items-center"><Layers size={12} className="mr-1" /> {course.lessonCount || 0} Lessons</span>
                            {course.quizCount > 0 && (
                                <span className="flex items-center"><HelpCircle size={12} className="mr-1" /> {course.quizCount} Quiz</span>
                            )}
                            {course.accessRule === 'PAID' && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                                    ${course.price}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        {isAdmin ? (
                            <div className="flex space-x-2 w-full">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/course/${course.id}/edit`); }}
                                >
                                    <Edit size={14} className="mr-1" /> Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={(e) => { e.stopPropagation(); onDelete(course.id); }}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        ) : (
                            <div className="w-full">
                                {getActionButton()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // --- LIST VIEW ---
    return (
        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-0 cursor-pointer" onClick={() => navigate(isAdmin ? `/admin/course/${course.id}/edit` : `/course/${course.id}`)}>
            <div className="flex items-center space-x-6 flex-1">
                {/* Image */}
                <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    <img src={course.image || 'https://placehold.co/100x100?text=Course'} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                    {isAdmin && (
                        <div className="absolute top-1 right-1">
                            <span className={`block w-2.5 h-2.5 rounded-full ring-2 ring-white ${course.published ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-gray-900 truncate mr-3">{course.title}</h3>
                        {isAdmin && (
                            <Badge variant={course.published ? "success" : "warning"} className="text-[10px] px-1.5 py-0">
                                {course.published ? 'Published' : 'Draft'}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center"><Clock size={12} className="mr-1" /> {calculateTotalDuration(course)}</span>
                        <span className="flex items-center"><Layers size={12} className="mr-1" /> {course.lessonCount || 0} Lessons</span>
                        {course.quizCount > 0 && (
                            <span className="flex items-center"><HelpCircle size={12} className="mr-1" /> {course.quizCount} Quiz</span>
                        )}
                        <span className="flex items-center"><Eye size={12} className="mr-1" /> {course.viewCount || 0} Views</span>
                    </div>
                </div>

                {/* Tags */}
                <div className="hidden md:flex gap-2 mr-6">
                    {course.tags && course.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                </div>

                {/* Price */}
                {course.accessRule === 'PAID' && (
                    <div className="font-bold text-gray-900 mr-6">
                        ${course.price}
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                {isAdmin ? (
                    <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/course/${course.id}/edit`)}>
                            <Edit size={14} className="mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/course/${course.id}`);
                            // assuming toast available or simple alert/console for now as prop not passed, but parent handles it usually. 
                            // Actually CourseCard doesn't have useToast. Let's just do the action.
                        }}>
                            <Share2 size={14} />
                        </Button>
                    </div>
                ) : (
                    getActionButton()
                )}
            </div>
        </div>
    )
}

export default CourseCard
