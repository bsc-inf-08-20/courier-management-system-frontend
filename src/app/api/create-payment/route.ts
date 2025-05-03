// src/app/api/create-payment/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, amount } = await request.json();

    // Determine the base URL (use production URL if available)
    const isProduction = process.env.NODE_ENV === "production";
    const baseUrl = isProduction
      ? "https://cmis-one.vercel.app"  // Replace with your actual domain
      : request.headers.get("origin") || "http://localhost:3000";

    const url = "https://api.paychangu.com/payment";
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
      },
      body: JSON.stringify({
        currency: "MWK",
        amount: amount,
        first_name: firstName,
        last_name: lastName,
        email: email,
        callback_url: `${baseUrl}/api/verify-payment`,  // Uses production URL in prod
        return_url: `${baseUrl}/customer/payment/return`,  // Uses production URL in prod
      }),
    };

    const response = await fetch(url, options);
    const result = await response.json();

    if (result.status === "success") {
      return NextResponse.json({
        success: true,
        checkoutUrl: result.data.checkout_url,
        txRef: result.data.data.tx_ref,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message || "Payment initiation failed",
      });
    }
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your payment",
      },
      { status: 500 }
    );
  }
}