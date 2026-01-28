import { NextResponse } from "next/server";
import CONFIG from "@/config/configuration";

type ChatRole = "user" | "assistant";

type IncomingMessage = {
  role: ChatRole;
  content: string;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildFallbackReply(message: string) {
  const text = message.toLowerCase();

  const contactLine = `If you need a human, contact Support: ${CONFIG.CONTACT_MAIL} or WhatsApp ${CONFIG.CONTACT_NUMBER}.`;

  if (/(track|tracking|where\s+is|delivery|ship|shipping|courier)/i.test(text)) {
    return [
      "For delivery updates:",
      "1) Open your Account → Orders.",
      "2) Select the order to see the latest status.",
      "3) If you have an order ID, paste it here and I’ll guide you to the next step.",
      "",
      contactLine,
    ].join("\n");
  }

  if (/(refund|return|cancel|cancellation|exchange)/i.test(text)) {
    return [
      "For cancellations / returns:",
      "1) Go to your Account → Orders.",
      "2) Open the order and look for Cancel / Return options (if available).",
      "3) If you tell me the issue (wrong item, damaged, late delivery), I’ll suggest the best route.",
      "",
      contactLine,
    ].join("\n");
  }

  if (/(payment|paystack|card|transfer|checkout|failed|declined)/i.test(text)) {
    return [
      "For payment / checkout issues:",
      "1) Confirm your network is stable and try again.",
      "2) If the payment was deducted but the order didn’t confirm, avoid retrying immediately.",
      "3) Share the order reference / time of payment (no card details), and Support can help confirm.",
      "",
      contactLine,
    ].join("\n");
  }

  if (/(seller|sell|vendor|join\s+us|store|shop)/i.test(text)) {
    return [
      "To become a seller:",
      "1) Tap “Join Us” in the header.",
      "2) Choose the seller type and submit your details.",
      "3) After approval, you can add products and manage orders.",
      "",
      contactLine,
    ].join("\n");
  }

  return [
    `I can help with orders, delivery, returns, payments, and becoming a seller on ${CONFIG.NAME}.`,
    "What would you like to do?",
    "- Track an order",
    "- Get help with checkout",
    "- Returns / cancellations",
    "- Seller onboarding",
    "",
    contactLine,
  ].join("\n");
}

async function generateOpenAIReply(messages: IncomingMessage[]) {
  const apiKey = normalizeText(process.env.OPENAI_API_KEY);
  if (!apiKey) return null;

  const model = normalizeText(process.env.OPENAI_MODEL) || "gpt-4o-mini";

  const systemPrompt = [
    `You are a helpful customer support assistant for ${CONFIG.NAME} (e-commerce).`,
    "Be concise, friendly, and actionable.",
    "Do not invent order statuses, payment confirmations, delivery ETAs, or user account details.",
    "If asked for personal data, advise the user to sign in and use the Orders/Account pages.",
    `If a user needs a human, suggest ${CONFIG.CONTACT_MAIL} and WhatsApp ${CONFIG.CONTACT_NUMBER}.`,
    "If you are unsure, ask 1-2 clarifying questions.",
  ].join(" ");

  const payload = {
    model,
    temperature: 0.3,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data?.choices?.[0]?.message?.content;
  return normalizeText(content) || null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      messages?: IncomingMessage[];
    };

    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    const sanitized = rawMessages
      .filter(
        (m) =>
          (m?.role === "user" || m?.role === "assistant") &&
          typeof m?.content === "string" &&
          m.content.trim().length > 0,
      )
      .slice(-12)
      .map((m) => ({
        role: m.role,
        content: m.content.trim().slice(0, 2000),
      }));

    const lastUser =
      sanitized
        .slice()
        .reverse()
        .find((m) => m.role === "user")?.content || normalizeText(body?.message);

    if (!lastUser) {
      return NextResponse.json(
        { reply: "Tell me what you need help with, and I’ll assist." },
        { status: 200 },
      );
    }

    const openAIReply = await generateOpenAIReply(sanitized);
    if (openAIReply) {
      return NextResponse.json({ reply: openAIReply }, { status: 200 });
    }

    return NextResponse.json(
      { reply: buildFallbackReply(lastUser) },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { reply: "Sorry — something went wrong. Please try again." },
      { status: 200 },
    );
  }
}

