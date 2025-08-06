import MeetingRoom from "@/components/video-conferencing/MeetingRoom";
import { Suspense } from "react";
import Loading from "@/components/Loading";

/**
 * RoomPage Component
 *
 * Serves as the main page for a video conferencing room.
 * Utilizes `Suspense` to lazy load the `MeetingRoom` component and displays
 * a loading spinner while the room is being set up.
 *
 * @component
 * @returns {JSX.Element} The rendered room page with suspense fallback.
 */
const RoomPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <MeetingRoom />
    </Suspense>
  );
};

export default RoomPage;
