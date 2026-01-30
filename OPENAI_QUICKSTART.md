# 🤖 OpenAI ChatBot - Quick Start Guide

Your Alaba Marketplace chatbot has been upgraded to use OpenAI's GPT-4 Turbo!

## ⚡ Quick Setup (2 minutes)

### Step 1: Get OpenAI API Key

1. Visit: https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk_`)

### Step 2: Add to .env.local

```bash
echo "OPENAI_API_KEY=sk_your_key_here" >> .env.local
```

Replace `sk_your_key_here` with your actual key from Step 1.

### Step 3: Restart Dev Server

```bash
npm run dev
```

✅ **Done!** The chatbot is now live with GPT-4 power!

---

## 🎯 What's New

### Before (Rule-Based)

- Pattern matching for intents
- Static knowledge base
- Limited conversational ability
- Predictable responses

### After (OpenAI GPT-4)

- **Natural language understanding** ✨
- **Contextual conversations** 💬
- **Intelligent answers** 🧠
- **Dynamic responses** 🎨
- **Nigerian market expertise** 🇳🇬

---

## 💡 Features

✅ Understands complex questions
✅ Maintains conversation context
✅ Provides accurate Alaba info
✅ Handles edge cases gracefully
✅ Cost-effective (~1 cent per conversation)

---

## 🔧 Testing

Test these questions in the chatbot:

1. "Hi! Can you explain your return policy?"
2. "How do I become a seller on Alaba?"
3. "What payment methods do you accept?"
4. "I want to track my order from yesterday"
5. "Tell me about shipping to Lagos"
6. "How do I reset my password?"

---

## 📊 Pricing

OpenAI costs are **minimal**:

- Average conversation: < 1¢
- 1000 conversations/day: ~$10/month
- Fully scalable

---

## 🔐 Security

✅ API key stored in `.env.local` (never committed)
✅ Server-side processing (client never sees key)
✅ OpenAI's secure infrastructure
✅ No data logging enabled

---

## 📈 Monitor Usage

Check your OpenAI dashboard: https://platform.openai.com/account/billing/overview

---

## ⚠️ Troubleshooting

**Chatbot not responding?**

- Check API key in `.env.local`
- Verify key starts with `sk_`
- Restart dev server
- Check OpenAI status: https://status.openai.com

**Too slow?**

- Normal: 1-3 seconds for GPT-4
- Want faster? Switch to gpt-3.5-turbo in code

**Rate limited?**

- Chatbot handles gracefully
- Try again in a moment
- Contact OpenAI for higher limits

---

## 📚 Documentation

- Full setup guide: `OPENAI_SETUP.md`
- Chatbot code: `src/components/chatbot/ChatBot.tsx`
- API endpoint: `src/app/api/chatbot/route.ts`

---

## 🚀 Advanced Customization

### Change Model

In `src/app/api/chatbot/route.ts`:

```typescript
model: "gpt-3.5-turbo"; // Cheaper & faster
// or
model: "gpt-4"; // More capable
```

### Adjust Tone

Edit the SYSTEM_PROMPT in the same file to customize personality, knowledge focus, etc.

### Add Custom Instructions

Add to SYSTEM_PROMPT:

```
## Additional Context:
- Current promotion: 20% off electronics
- New product category: Smart Home
```

---

## 🎉 You're All Set!

Your Alaba Marketplace chatbot is now powered by GPT-4 Turbo. It's intelligent, natural, and ready to help your customers 24/7!

Click the chat button → start a conversation → experience the difference! 🚀
