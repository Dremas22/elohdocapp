/**
 * Renders a single appointment card with date, time, role, and optional note.
 * Clicking the card navigates the user to the appointment's meeting link.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.appt - Appointment details.
 * @param {string} props.appt.date - Appointment date (e.g., "2025-09-12").
 * @param {string} props.appt.time - Appointment time (e.g., "10:30 AM").
 * @param {string} props.appt.targetRole - The role the appointment is with (e.g., "Doctor" or "Nurse").
 * @param {string} props.appt.meetingLink - URL for the appointment meeting.
 * @param {string} [props.appt.note] - Optional note about the appointment.
 *
 * @example
 * const appt = {
 *   date: "2025-09-12",
 *   time: "10:30 AM",
 *   targetRole: "Doctor",
 *   meetingLink: "/meeting/123",
 *   note: "Bring medical history"
 * };
 *
 * <AppointmentCard appt={appt} />
 */
const AppointmentCard = ({ appt }) => {
  return (
    <li
      className="pl-4 border-l-4 border-[#0d6efd] bg-gray-50 p-3 rounded-md cursor-pointer hover:border-[#527cbb]"
      onClick={() => router.push(appt?.meetingLink)}
    >
      <div className="text-sm">
        <span className="font-semibold">{appt.date}</span> at{" "}
        <span className="font-semibold">{appt.time}</span> ({appt.targetRole})
      </div>
      {appt.note && (
        <div className="text-xs text-gray-500 mt-1">Note: {appt.note}</div>
      )}
    </li>
  );
};

export default AppointmentCard;
