import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const agentId = params.agentId;
    const body = await request.json();
    const { packetId, timestamp } = body;

    // Call your NestJS backend to update the status
    const response = await axios.post(
      `${process.env.BACKEND_API_URL}/agents/${agentId}/reached-destination`,
      { packetId, timestamp },
      {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Error updating reached destination status:', error);
    
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Failed to update status';
    
    return NextResponse.json({ error: errorMessage }, { status });
  }
}