const FareDetails = ({ fareDetails }) => {
  return (
    <div className="mt-4 bg-gray-50 text-black p-4 rounded border">
      <h3 className="font-semibold mb-2">Trip summary</h3>
      <p>
        <strong>Destination:</strong>{" "}
        {fareDetails?.destination?.address || fareDetails?.destination?.address}
      </p>
      <p>
        <strong>Distance:</strong> {fareDetails?.distance} km
      </p>
      <p>
        <strong>Duration:</strong> {fareDetails?.duration} min
      </p>
      <p>
        <strong>Fare:</strong> R{fareDetails?.fare}
      </p>
    </div>
  );
};

export default FareDetails;
