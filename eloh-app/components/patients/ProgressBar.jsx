import { FaCheck } from "react-icons/fa";

const ProgressBar = ({ currentStep, steps }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex-1 text-center">
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-white
                ${
                  isActive
                    ? "bg-blue-600"
                    : isCompleted
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
            >
              {isCompleted ? (
                <FaCheck className="text-white text-sm" />
              ) : (
                index + 1
              )}
            </div>
            <p
              className={`mt-2 text-xs ${
                isActive
                  ? "text-blue-600"
                  : isCompleted
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressBar;
