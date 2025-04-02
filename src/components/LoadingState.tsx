import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const LoadingState = ({ 
  text = 'Loading...', 
  size = 'md', 
  fullPage = false 
}: LoadingStateProps) => {
  // Determine spinner size based on prop
  const spinnerSizeMap = {
    sm: 16,
    md: 24,
    lg: 36
  };

  // Determine text size based on prop
  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinnerSize = spinnerSizeMap[size];
  const textSize = textSizeMap[size];

  const loadingContent = (
    <div className="flex flex-col items-center justify-center">
      <Loader2 
        size={spinnerSize} 
        className="animate-spin text-purple-600 mb-2" 
      />
      <p className={`${textSize} text-gray-600 dark:text-gray-400`}>{text}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        {loadingContent}
      </div>
    );
  }

  return (
    <div className="py-8 px-4 flex items-center justify-center">
      {loadingContent}
    </div>
  );
};

export default LoadingState; 