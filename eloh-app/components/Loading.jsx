/**
 * Loading Component
 *
 * Displays a full-screen loading spinner with a customizable message.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.message="Loading your meeting room..."] - The loading message to display
 * @returns {JSX.Element}
 */
const Loading = ({ message = "Loading your meeting room..." }) => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-800 w-[80vw]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mb-4" />
        <p className="text-lg font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
