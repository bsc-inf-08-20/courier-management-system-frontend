// pages/admin/book-pickup-requests.jsx (Server Component)
import BookPickupRequestsPage from "./BookPickupRequestsPage";

async function fetchPickupRequests(token) {
  const res = await fetch("http://localhost:3001/admin/pickup-requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function fetchAgents(token) {
  const res = await fetch("http://localhost:3001/admin/agents", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export default async function PickupRequestsServerPage({ token }) {
  const pickupRequests = await fetchPickupRequests(token);
  const agents = await fetchAgents(token);

  return <BookPickupRequestsPage initialRequests={pickupRequests} initialAgents={agents} />;
}