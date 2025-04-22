// src/app/customer/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get and parse the request body
    const body = await request.json();
    
    // Process the payment callback
    // Here you would typically:
    // 1. Verify the payment status
    // 2. Update your database
    // 3. Send confirmation emails
    // 4. etc.
    
    console.log('Payment callback received:', body);
    
    // Example: Check payment status
    const paymentStatus = body.data?.status;
    // const txRef = body.data?.tx_ref;
    
    if (paymentStatus === 'successful') {
      // Update order status in your database
      // await updateOrderStatus(txRef, 'paid');
      
      // Send confirmation email
      // await sendPaymentConfirmationEmail(body.data.email);
    }
    
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing payment callback:', error);
    return NextResponse.json(
      { error: 'Failed to process payment callback' }, 
      { status: 500 }
    );
  }
}