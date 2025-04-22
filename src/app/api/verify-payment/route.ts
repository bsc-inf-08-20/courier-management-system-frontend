// src/app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txRef = searchParams.get('tx_ref');

    if (!txRef) {
      return NextResponse.json(
        { success: false, message: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.PAYCHANGU_API_KEY ||
      'sec-test-UOIha9XzUVphARJLtGlMYRaHYLeoq3bK';

    const url = `https://api.paychangu.com/verify-payment/${txRef}`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    };

    const response = await fetch(url, options);
    const result = await response.json();

    if (result.status === 'success') {
      return NextResponse.json({
        success: true,
        payment: result.data,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message || 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while verifying the payment',
      },
      { status: 500 }
    );
  }
}
