import BookingConfirmation from "@/components/booking/BookingConfirmation";

interface ConfirmationPageProps {
  searchParams: Promise<{ bookingId?: string; reference?: string }>;
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6 md:px-12">
      <BookingConfirmation bookingId={params.bookingId} reference={params.reference} />
    </div>
  );
}
