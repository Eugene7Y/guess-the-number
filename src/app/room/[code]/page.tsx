import RoomView from "@/components/RoomView";

export default function RoomPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  return <RoomView code={code} />;
}
