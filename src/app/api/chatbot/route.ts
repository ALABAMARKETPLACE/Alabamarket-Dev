import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import CONFIG from "@/config/configuration";

// Lazy initialization of OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

const SUPPORT_INFO = {
  phone: CONFIG.CONTACT_NUMBER,
  email: CONFIG.CONTACT_MAIL,
  website: CONFIG.WEBSITE,
  name: CONFIG.NAME,
};

const SYSTEM_PROMPT = `You are an intelligent, professional, and friendly shopping assistant for Alaba Marketplace, a leading e-commerce platform in Africa. Your role is to provide exceptional customer service and help customers with their shopping journey.

**IMPORTANT - Support Contact Information:**
When customers ask to contact support, reach out for help, or need assistance contact:
- 📞 Phone: ${SUPPORT_INFO.phone}
- 📧 Email: ${SUPPORT_INFO.email}
- 🌐 Website: ${SUPPORT_INFO.website}

Key capabilities and knowledge:
1. **Product Assistance**: Help customers search for products, describe product features, provide recommendations based on categories (Electronics, Fashion, Home & Garden, Sports, Books, etc.)
2. **Order Management**: Guide customers through checkout, explain order statuses, help with payment methods (Cards, Bank Transfer, USSD, Paystack)
3. **Shipping & Delivery**: Provide information about shipping times (Standard: 3-5 days, Express: 1-2 days), track orders, answer delivery questions
4. **Returns & Refunds**: Explain return policies, help with returns within 30 days, guide through refund processes
5. **Seller Information**: Help customers become sellers, explain commission rates, provide seller guidelines
6. **Account Management**: Assist with login, password reset, profile updates, saved preferences
7. **Promotions**: Share current deals, seasonal sales, loyalty programs
8. **Technical Support**: Help with app/website issues, account security
9. **Contact Support**: When needed, provide: 📞 ${SUPPORT_INFO.phone} or 📧 ${SUPPORT_INFO.email}

Guidelines:
- Always be polite, patient, and professional
- Use clear, concise language suitable for all audiences
- When uncertain, acknowledge and offer to escalate to human support
- Provide specific, actionable information
- Use emojis sparingly but appropriately to add warmth
- Ask clarifying questions when needed
- Remember context from the conversation to provide personalized responses
- For urgent issues (fraud, security), recommend immediate customer support contact: ${SUPPORT_INFO.phone}
- If the question is outside your scope, politely redirect to support team or appropriate channels
- Always include contact information when directing customers to support

Personality:
- Helpful and proactive
- Professional yet approachable
- Knowledgeable and confident
- Patient and understanding
- Solutions-focused

Always prioritize customer satisfaction and aim to resolve issues in the first interaction. When customers need to speak to a human, provide the support contact information clearly.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    // Prepare conversation messages
    const messages: ConversationMessage[] = [
      ...(conversationHistory as ConversationMessage[]),
      {
        role: "user",
        content: message,
      },
    ];

    // Call OpenAI API
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
    });

    const botMessage =
      response.choices[0]?.message?.content ||
      "I'm sorry, I couldn't process that. Please try again.";

    return NextResponse.json({ message: botMessage });
  } catch (error) {
    console.error("Chatbot API Error:", error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "Service configuration error" },
        { status: 500 },
      );
    }

    // Generic error handler
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error:
          "An error occurred while processing your message. Please try again later.",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
