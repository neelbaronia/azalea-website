import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (process.env.VERCEL_ENV === "production" && secretKey.startsWith("sk_test_")) {
    throw new Error("Production checkout cannot use a Stripe test key");
  }

  return new Stripe(secretKey);
}

export async function POST() {
  const stripe = getStripe();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get or create Stripe customer
  const admin = createAdminClient();
  const { data: existingSubscription } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .limit(1)
    .maybeSingle();

  if (existingSubscription) {
    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error("STRIPE_PRICE_ID is not configured");
  }

  const price = await stripe.prices.retrieve(priceId);
  if (!price.active || price.type !== "recurring") {
    throw new Error("STRIPE_PRICE_ID must reference an active recurring price");
  }
  if (process.env.VERCEL_ENV === "production" && !price.livemode) {
    throw new Error("Production checkout cannot use a Stripe test price");
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: user.id,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
