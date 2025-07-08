import React from 'react';

function MessageBox({ message, onConfirm, onCancel, type = 'info' }) {
  const bgColor = type === 'error' ? 'bg-red-100' : 'bg-blue-100';
  const borderColor = type === 'error' ? 'border-red-400' : 'border-blue-400';
  const textColor = type === 'error' ? 'text-red-700' : 'text-blue-700';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
        <div className={`${bgColor} ${borderColor} ${textColor} border p-3 rounded-md mb-4`}>
          <p className="font-semibold">{message}</p>
        </div>
        <div className="flex justify-center space-x-4">
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBox;