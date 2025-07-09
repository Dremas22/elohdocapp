"use client";

const NotificationModal = ({ payload, onClose }) => {
  if (!payload) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="relative z-50 bg-white dark:bg-[#1e293b] rounded-lg shadow-2xl p-6 w-full max-w-xl mx-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Notification Payload
        </h2>

        <pre className="bg-gray-100 dark:bg-gray-900 text-sm p-4 rounded overflow-auto max-h-[60vh] text-black dark:text-white">
          {JSON.stringify(payload, null, 2)}
        </pre>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
