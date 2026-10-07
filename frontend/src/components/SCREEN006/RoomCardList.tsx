import { RoomCard, type RoomSummary } from "./RoomCard";

/** Grid of owned room cards. */
export function RoomCardList({ rooms }: { rooms: RoomSummary[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}
