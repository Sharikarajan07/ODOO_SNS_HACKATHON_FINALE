import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts((prev) => [...prev, { id, message, type }])

        if (duration) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }, [])

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((t) => (
                    <ToastItem key={t.id} {...t} onClose={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

const ToastItem = ({ message, type, onClose }) => {
    const icons = {
        success: <CheckCircle size={18} className="text-green-500" />,
        error: <AlertCircle size={18} className="text-red-500" />,
        warning: <AlertTriangle size={18} className="text-amber-500" />,
        info: <Info size={18} className="text-blue-500" />,
    }

    const styles = {
        success: 'border-green-100 bg-white',
        error: 'border-red-100 bg-white',
        warning: 'border-amber-100 bg-white',
        info: 'border-blue-100 bg-white',
    }

    return (
        <div className={`flex items-center w-80 p-4 rounded-lg shadow-lg border border-l-4 ${styles[type]} animate-slide-in-right transform transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex-shrink-0 mr-3">{icons[type]}</div>
            <div className="flex-1 text-sm font-medium text-gray-800">{message}</div>
            <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
            </button>
        </div>
    )
}
