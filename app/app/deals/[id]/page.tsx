import { DealRoom } from "@/components/app/deal-room/deal-room"

// Demo deal data
const demoDeal = {
  id: "deal-4521",
  address: "123 Main St",
  city: "Austin",
  state: "TX",
  zip: "78701",
  status: "analyzing",
  signal: "BUY" as const,
  purchasePrice: 185000,
  arv: 275000,
  rehabBudget: 45000,
  projectedProfit: 67500,
  roi: 24.3,
  cashNeeded: 92500,
  createdAt: "2024-01-15",
  updatedAt: "2024-01-18",
}

export default function DealRoomPage({ params }: { params: { id: string } }) {
  return <DealRoom deal={demoDeal} />
}
