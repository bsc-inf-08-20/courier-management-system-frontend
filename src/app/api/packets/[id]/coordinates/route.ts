import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const packetId = params.id;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/packets/${packetId}/origin-coordinates`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch packet coordinates');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PACKET_COORDINATES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}