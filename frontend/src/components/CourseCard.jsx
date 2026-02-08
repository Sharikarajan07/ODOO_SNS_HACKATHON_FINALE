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
                className="group bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative flex flex-col h-full cursor-pointer"
                onClick={() => navigate(isAdmin ? `/admin/course/${course.id}/edit` : `/course/${course.id}`)}
            >
                {/* Image & Overlay */}
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                    {!imgError && course.image ? (
                        <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300">
                            <BookOpen size={56} strokeWidth={1.5} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Status Badge (Admin only) */}
                    {isAdmin && (
                        <div className="absolute top-4 right-4 z-10">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-xl shadow-xl border-2 transition-all duration-300 group-hover:scale-110 ${course.published
                                ? 'bg-emerald-500/95 text-white border-emerald-300 shadow-emerald-500/50'
                                : 'bg-amber-400/95 text-white border-amber-200 shadow-amber-400/50'
                                }`}>
                                {course.published ? 'Active' : 'Draft'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-7 flex-1 flex flex-col">
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {course.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-5 h-10 leading-relaxed">
                            {course.description || 'No description provided.'}
                        </p>

                        {/* Tags */}
                        {course.tags && course.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {course.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs py-1 px-3 bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 rounded-full">{tag}</Badge>
                                ))}
                            </div>
                        )}

                        {/* Metadata Row */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm">
                            <span className="flex items-center font-semibold"><Clock size={14} className="mr-1.5 text-indigo-500" /> {calculateTotalDuration(course)}</span>
                            <span className="flex items-center font-semibold"><Layers size={14} className="mr-1.5 text-purple-500" /> {course.lessonCount || 0} Lessons</span>
                            {course.quizCount > 0 && (
                                <span className="flex items-center font-semibold"><HelpCircle size={14} className="mr-1.5 text-blue-500" /> {course.quizCount} Quiz</span>
                            )}
                            {course.accessRule === 'PAID' && (
                                <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200 font-bold shadow-sm">
                                    ${course.price}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                        {isAdmin ? (
                            <div className="flex items-center gap-2 w-full">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg font-semibold border-0 text-sm py-2 flex items-center justify-center"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/course/${course.id}/edit`); }}
                                >
                                    <Edit size={14} className="mr-2" /> 
                                    <span>Edit</span>
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg border-0 px-3 py-2 flex items-center justify-center"
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
        <div className="p-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/20 transition-all duration-300 group border-b border-gray-100 last:border-0 cursor-pointer" onClick={() => navigate(isAdmin ? `/admin/course/${course.id}/edit` : `/course/${course.id}`)}>
            <div className="flex items-center space-x-6 flex-1">
                {/* Image */}
                <div className="w-28 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0 relative shadow-md group-hover:shadow-lg transition-shadow">
                    <img src={course.image || 'https://placehold.co/100x100?text=Course'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.style.display = 'none'} />
                    {isAdmin && (
                        <div className="absolute top-1.5 right-1.5">
                            <span className={`block w-3 h-3 rounded-full ring-2 ring-white shadow-sm ${course.published ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                        <h3 className="font-bold text-lg text-gray-900 truncate mr-3 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                        {isAdmin && (
                            <Badge variant={course.published ? "success" : "warning"} className="text-[10px] px-2 py-0.5 font-bold shadow-sm">
                                {course.published ? 'Published' : 'Draft'}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center text-sm text-gray-500 space-x-5 font-medium">
                        <span className="flex items-center"><Clock size={14} className="mr-1.5 text-indigo-500" /> {calculateTotalDuration(course)}</span>
                        <span className="flex items-center"><Layers size={14} className="mr-1.5 text-purple-500" /> {course.lessonCount || 0} Lessons</span>
                        {course.quizCount > 0 && (
                            <span className="flex items-center"><HelpCircle size={14} className="mr-1.5 text-blue-500" /> {course.quizCount} Quiz</span>
                        )}
                        <span className="flex items-center"><Eye size={14} className="mr-1.5 text-emerald-500" /> {course.viewCount || 0} Views</span>
                    </div>
                </div>

                {/* Tags */}
                <div className="hidden lg:flex gap-2 mr-6">
                    {course.tags && course.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs py-1 px-3 bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 rounded-full">{tag}</Badge>
                    ))}
                </div>

                {/* Price */}
                {course.accessRule === 'PAID' && (
                    <div className="font-black text-xl text-gray-900 mr-6 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-2 rounded-xl border border-amber-200 shadow-sm">
                        ${course.price}
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {isAdmin ? (
                    <>
                        <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 rounded-lg font-semibold px-4 py-2 shadow-sm hover:shadow-md flex items-center group border-0"
                            onClick={() => navigate(`/admin/course/${course.id}/edit`)}
                        >
                            <Edit size={14} className="mr-2" /> 
                            <span>Edit</span>
                        </Button>
                        <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 rounded-lg px-3 py-2 shadow-sm hover:shadow-md border-0"
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/course/${course.id}`);
                            }}
                        >
                            <Share2 size={14} />
                        </Button>
                    </>
                ) : (
                    getActionButton()
                )}
            </div>
        </div>
    )
}

export default CourseCard
