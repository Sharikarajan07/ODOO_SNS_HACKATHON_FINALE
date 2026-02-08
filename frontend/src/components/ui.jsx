export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  }
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
  }

  return (
    <button 
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export const Select = ({ label, options, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-200 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export const Progress = ({ value, max = 100, className = '' }) => {
  const percentage = (value / max) * 100

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-primary-600 h-2 rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
