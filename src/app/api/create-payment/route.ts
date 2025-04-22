// src/app/api/create-payment/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, amount } = await request.json();

    // Get the origin for callback and return URLs
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const url = "https://api.paychangu.com/payment";
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer sec-test-UOIha9XzUVphARJLtGlMYRaHYLeoq3bK",
      },
      body: JSON.stringify({
        currency: "MWK",
        amount: amount,
        first_name: firstName,
        last_name: lastName,
        email: email,
        callback_url: `cmis-one.vercel.app/api/verify-payment`,
        return_url: `${origin}/customer/payment/return`,
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
