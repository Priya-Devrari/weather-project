'use client';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="bg-red-500/10 backdrop-blur-md rounded-3xl p-8 border border-red-500/20 text-center">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">Oops! Something went wrong</h3>
      <p className="text-white/80 mb-6">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/30 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
