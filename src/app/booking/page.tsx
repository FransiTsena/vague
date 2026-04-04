import BookingFlow from "@/components/booking/BookingFlow";

interface BookingPageProps {
  searchParams: Promise<{ roomId?: string }>;
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const initialRoomId = params.roomId;

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6 md:px-12">
      <div className="mx-auto mb-16 max-w-7xl">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">VAGUE Resort</p>
        <h1 className="mt-3 text-5xl md:text-7xl font-serif tracking-tight">Your Reservation</h1>
        <p className="mt-6 max-w-2xl text-lg md:text-xl text-neutral-500 font-light leading-relaxed">
          Secure your stay with an effortless, intelligent booking experience.
        </p>
      </div>

      <BookingFlow initialRoomId={initialRoomId} />
    </div>
  );
}
