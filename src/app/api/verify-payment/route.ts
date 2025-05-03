// src/app/api/verify-payment/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const txRef = searchParams.get('tx_ref');

    if (!txRef) {
      return NextResponse.json(
        { success: false, message: 'Transaction reference missing' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.paychangu.com/verify-payment/${txRef}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`
      }
    });

    const data = await response.json();

    if (data.status !== 'success') {
      return NextResponse.json(
        { success: false, message: data.message || 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Here you can save the payment details to your database
    // For example: await savePaymentToDatabase(data.data);

    return NextResponse.json({
      success: true,
      paymentData: data.data
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}