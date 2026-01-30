import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface RequestBody {
  message: string;
  conversationHistory: Message[];
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e246411 (Done)
// Initialize OpenAI client lazily (inside handler to avoid build-time errors)
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}
<<<<<<< HEAD
=======
// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
>>>>>>> 2b3b6c8 (Done)
=======
>>>>>>> e246411 (Done)

// System prompt that defines the chatbot's role and behavior
const SYSTEM_PROMPT = `You are Alaba Assistant, a knowledgeable and friendly customer support chatbot for Alaba Marketplace, Nigeria's premier e-commerce platform. Your role is to help customers with shopping, orders, seller information, and support.

## About Alaba Marketplace:
- Leading Nigerian e-commerce platform
- Categories: Electronics, Fashion, Home & Garden, Food, Beauty, Books, etc.
- Payment methods: Visa, Mastercard, Verve cards, Bank Transfer, USSD, Paystack (secure gateway)
- Delivery: Lagos (1-2 days), Other cities (2-4 days)
- Return policy: 30 days, original condition, full refund
- Seller commission: Varies by category, easy registration process

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 7be3989 (Done)
## Contact Information:
- Support email: support@alabamarket.com
- Support phone: +234 701 234 5678
- Support hours: 9 AM - 6 PM WAT, Monday-Friday
- Live chat: Available through this chatbot

<<<<<<< HEAD
## Key Information:
- Order placement: Browse → Add to cart → Checkout → Select address → Choose payment → Confirm
- Shipping: All deliveries tracked via SMS and email with tracking links
=======
## Key Information:
- Order placement: Browse → Add to cart → Checkout → Select address → Choose payment → Confirm
- Shipping: All deliveries tracked via SMS and email with tracking links
- Support email: support@alabamarket.com
- Support hours: 9 AM - 6 PM WAT, Monday-Friday
- Live chat: Available through this chatbot
>>>>>>> 2b3b6c8 (Done)
=======
## Key Information:
- Order placement: Browse → Add to cart → Checkout → Select address → Choose payment → Confirm
- Shipping: All deliveries tracked via SMS and email with tracking links
>>>>>>> 7be3989 (Done)
- Returns: 30-day hassle-free returns, request through account

## Your Guidelines:
1. Always be friendly, professional, and helpful
2. Provide accurate information about Alaba Marketplace services
3. If asked about something outside Alaba's services, politely redirect to relevant topics
4. Use Nigerian context and currency (₦ for Naira)
5. Provide step-by-step instructions when needed
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 7be3989 (Done)
6. When users want to call support, mention: "📞 Call us at +234 701 234 5678"
7. If you don't know specific information, suggest contacting support@alabamarket.com or calling +234 701 234 5678
8. For frustrated users: "If this requires immediate attention, please call our support team at +234 701 234 5678 (9 AM - 6 PM WAT)"
9. Use emojis occasionally to maintain friendly tone
10. Keep responses concise but informative
<<<<<<< HEAD
=======
6. If you don't know specific information, suggest contacting support@alabamarket.com
7. For Nigerian customers: Emphasize local payment methods and delivery speed
8. Use emojis occasionally to maintain friendly tone
9. Keep responses concise but informative
10. If user seems frustrated, offer to escalate to human support
>>>>>>> 2b3b6c8 (Done)
=======
>>>>>>> 7be3989 (Done)

## Common Topics You Handle:
- Product search and browsing
- Order placement and tracking
- Payment methods and checkout
- Shipping and delivery times
- Return and refund processes
- Becoming a seller on the platform
- Account management and login issues
- Pricing and available discounts
- FAQ and general customer support`;

// Convert message history to OpenAI format
function convertToOpenAIMessages(
  conversationHistory: Message[],
  currentMessage: string,
) {
  const messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }> = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
  ];

  // Add conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      });
    });
  }

  // Add current message
  messages.push({
    role: "user",
    content: currentMessage,
  });

  return messages;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { reply: "Please type a message." },
        { status: 400 },
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return NextResponse.json(
        {
          reply:
            "Chatbot service is temporarily unavailable. Please try again later or contact support@alabamarket.com",
        },
        { status: 503 },
      );
    }

    // Convert conversation history to OpenAI format
    const messages = convertToOpenAIMessages(conversationHistory, message);

    // Call OpenAI API
<<<<<<< HEAD
<<<<<<< HEAD
    const openai = getOpenAIClient();
=======
>>>>>>> 2b3b6c8 (Done)
=======
    const openai = getOpenAIClient();
>>>>>>> e246411 (Done)
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
    });

    const reply =
      response.choices[0]?.message?.content ||
      "I apologize, but I couldn't process your message. Please try again.";

    // Log for analytics (optional)
    console.log(`[Chatbot] User: ${message}`);
    console.log(`[Chatbot] Reply: ${reply}`);

    return NextResponse.json(
      {
        reply: reply.trim(),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Chatbot API Error:", errorMessage);

    // Provide helpful error messages
    if (errorMessage.includes("API key")) {
      return NextResponse.json(
        {
          reply: "Chatbot configuration error. Please contact support.",
        },
        { status: 500 },
      );
    }

    if (errorMessage.includes("rate limit")) {
      return NextResponse.json(
        {
          reply:
            "I'm getting too many requests. Please wait a moment and try again.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        reply:
          "I encountered an error processing your message. Please try again or contact support@alabamarket.com",
      },
      { status: 500 },
    );
  }
}
