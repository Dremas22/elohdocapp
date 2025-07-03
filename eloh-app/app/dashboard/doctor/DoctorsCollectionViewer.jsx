"use client";

const DoctorsCollectionViewer = ({ userDoc, patients = [] }) => {
  const { fullName, email, isVerified, photoUrl, practiceNumber } =
    userDoc || {};

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r shadow p-4">
        {/* Avatar & Info */}
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="User Avatar"
            className="w-24 h-24 rounded-full mx-auto"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto" />
        )}
        <div className="text-center mt-4">
          <p className="font-semibold">{fullName || email}</p>
          <p className="text-sm text-gray-500">
            Practice No: {practiceNumber || "N/A"}
          </p>
        </div>

        {!isVerified && (
          <p className="mt-4 text-yellow-700 text-sm bg-yellow-100 border border-yellow-400 rounded p-2 text-center">
            Your account is pending verification.
          </p>
        )}
      </aside>

      <main className="flex-1 p-6">
        {isVerified ? (
          <>
            <h1 className="text-xl font-semibold mb-4">Patients</h1>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {/** TODO: Add patient data here */}
              {JSON.stringify(patients, null, 2)}
            </pre>
          </>
        ) : (
          <div className="text-center mt-12 text-gray-600">
            <h2 className="text-lg font-semibold mb-2">
              Verification Required
            </h2>
            <p>
              You will gain access to patient information once your account is
              verified.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorsCollectionViewer;
