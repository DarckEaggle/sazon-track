import { getOrder } from "@/lib/actions/orders";
import { TrackClient } from "./TrackClient";
import { notFound } from "next/navigation";

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { order, success } = await getOrder(resolvedParams.id);

  if (!success || !order) {
    return notFound();
  }

  return (
    <div className="max-w-lg mx-auto px-4 md:pt-28 pb-8">
      <TrackClient initialOrder={order} />
    </div>
  );
}
