// src/app/api/create-payment/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, amount } = await request.json();

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://cmis-one.vercel.app"
        : "http://localhost:3000";

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
        callback_url: `${baseUrl}/customer/payment/return`,
        return_url: `${baseUrl}/customer/payment/return`, // Make sure this matches your route
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
