import MeetingRoom from "@/components/video-conferencing/MeetingRoom";
import { Suspense } from "react";

export default function RoomPage() {
  return (
    <Suspense fallback={<div>Loading room...</div>}>
      <MeetingRoom />
    </Suspense>
  );
}
