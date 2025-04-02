import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const ErrorState = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  size = 'md',
  fullPage = false
}: ErrorStateProps) => {
  // Determine icon size based on prop
  const iconSizeMap = {
    sm: 20,
    md: 32,
    lg: 48
  };

  // Determine text size based on prop
  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSize = iconSizeMap[size];
  const textSize = textSizeMap[size];

  const errorContent = (
    <div className="flex flex-col items-center justify-center">
      <AlertTriangle
        size={iconSize}
        className="text-red-500 mb-3"
      />
      <p className={`${textSize} text-gray-700 dark:text-gray-300 text-center mb-4 max-w-md`}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center shadow-sm"
        >
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </button>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50">
        {errorContent}
      </div>
    );
  }

  return (
    <div className="py-8 px-4 flex items-center justify-center">
      {errorContent}
    </div>
  );
};

export default ErrorState; 