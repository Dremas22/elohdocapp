const ProgressBar = ({ currentStep, steps }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      {steps.map((label, index) => (
        <div key={index} className="flex-1 text-center">
          <div
            className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-white
              ${
                index === currentStep
                  ? "bg-blue-600"
                  : index < currentStep
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
          >
            {index + 1}
          </div>
          <p
            className={`mt-2 text-xs ${
              index === currentStep ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
