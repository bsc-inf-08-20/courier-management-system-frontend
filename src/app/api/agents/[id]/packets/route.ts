// // app/api/agents/[id]/packets/route.ts
// import { NextResponse } from "next/server";
// import { headers } from "next/headers";

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   console.log("[API] Fetching packets for agent:", params.id);

//   try {
//     const headersList = headers();
//     const authHeader = (await headersList).get("authorization");
    
//     console.log("[API] Authorization header:", authHeader ? "exists" : "missing");
    
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       console.error("[API] No valid authorization token found");
//       return NextResponse.json(
//         { error: "Authorization token required" },
//         { status: 401 }
//       );
//     }

//     const token = authHeader.split(" ")[1];
//     console.log("[API] Extracted token:", token ? "exists" : "missing");

//     // Debug: Print full request URL
//     const requestUrl = `http://localhost:3001/packets/agents/${params.id}/assigned-packets`;
//     console.log("[API] Making request to:", requestUrl);
//     console.log("[API] Request headers:", {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json"
//     });

//     const response = await fetch(requestUrl, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });

//     console.log("[API] Backend response status:", response.status);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("[API] Backend response error:", response.status, errorText);
//       return NextResponse.json(
//         { error: "Failed to fetch packets" },
//         { status: response.status }
//       );
//     }

//     const data = await response.json();
//     console.log("[API] Successfully fetched packets:", data.length);

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("[API] Error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }