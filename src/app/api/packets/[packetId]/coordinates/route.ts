import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// This API route handles requests to get packet coordinates
export async function GET(
  request: NextRequest,
  { params }: { params: { packetId: string } }
) {
  try {
    const packetId = params.packetId;

    // Call your NestJS backend endpoint to get the packet coordinates
    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/packets/${packetId}/coordinates`,
      {
        headers: {
          // Get the auth token from the request cookies or headers as needed
          Authorization: request.headers.get('Authorization') || '',
        },
      }
    );

    // Return the coordinates from the backend
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching packet coordinates:', error);
    
    // Return appropriate error response
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Failed to fetch packet coordinates';
    
    return NextResponse.json({ error: errorMessage }, { status });
  }
}