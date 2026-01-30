# Alaba Marketplace ChatBot

A sophisticated and intelligent chatbot system integrated into the Alaba Marketplace e-commerce platform.

## Features

### 🤖 Intelligent Conversation

- **Intent Recognition**: Automatically detects user intent from 9+ categories
  - Greetings
  - Product searches
  - Order inquiries
  - Shipping & delivery
  - Returns & refunds
  - Seller information
  - Customer support
  - Pricing questions
  - Account management

### 💬 Chat Interface

- **Floating Widget**: Fixed position button that toggles chat window
- **Responsive Design**: Mobile-friendly interface that adapts to all screen sizes
- **Message History**: Maintains conversation history within session
- **Real-time Typing**: Shows loading state while chatbot processes responses
- **Copy Functionality**: Users can copy bot responses with one click

### 🎯 Context-Aware Responses

- **Knowledge Base**: Comprehensive database of Alaba Marketplace information
- **Entity Extraction**: Identifies key information in user messages (prices, categories)
- **Follow-up Suggestions**: Generates contextual follow-up questions
- **Conversation Flow**: Maintains context across multiple exchanges

### 📱 User Experience

- **Smooth Animations**: Slide-up animations for window and messages
- **Timestamps**: Each message shows when it was sent
- **Error Handling**: Graceful error messages and recovery
- **Accessibility**: Keyboard support (Enter to send, Shift+Enter for new line)

## Architecture

### Components

- **ChatBot.tsx**: Main React component with chat UI
- **chatbot.scss**: Styling with gradient themes matching Alaba branding
- **route.ts**: Backend API endpoint for processing messages

### File Structure

```
src/
├── components/
│   └── chatbot/
│       ├── ChatBot.tsx          # Main component
│       └── chatbot.scss         # Styles
├── app/
│   ├── api/
│   │   └── chatbot/
│   │       └── route.ts         # API endpoint
│   └── layout.tsx               # Integration point
```

## Key Capabilities

### Intent Patterns

The chatbot recognizes patterns in user messages:

```typescript
- Greeting: /^(hello|hi|hey|greetings|howdy)/i
- Products: /(product|item|search|find|looking for)/i
- Orders: /(order|purchase|buy|checkout|payment)/i
- Shipping: /(ship|delivery|deliver|track|when will|how long|arrives?)/i
- Returns: /(return|refund|exchange|cancel)/i
- Seller: /(sell|become seller|join as|seller|vendor)/i
- Support: /(help|support|contact|issue|problem|complaint)/i
- Price: /(price|cost|how much|expensive|cheap|discount|offer)/i
- Account: /(account|profile|login|register|sign up|password)/i
```

### Response Logic

1. **Message Analysis**: Examines user input for intent
2. **Entity Recognition**: Extracts relevant information
3. **Knowledge Lookup**: Retrieves appropriate response from database
4. **Context Enhancement**: Adds conversation-aware follow-ups
5. **Personalization**: Adapts responses based on conversation history

## Knowledge Base Coverage

The chatbot has built-in knowledge about:

- ✅ Product browsing and search
- ✅ Order placement process
- ✅ Shipping and delivery times
- ✅ Return and refund policies
- ✅ Seller registration process
- ✅ Payment methods (Cards, Bank Transfer, USSD, Paystack)
- ✅ Account management
- ✅ Customer support channels
- ✅ FAQ answers
- ✅ Pricing and discounts

## API Endpoint

### POST /api/chatbot

Processes user messages and returns intelligent responses.

**Request:**

```json
{
  "message": "How do I track my order?",
  "conversationHistory": [
    {
      "id": "1",
      "text": "Hello! How can I help?",
      "sender": "bot",
      "timestamp": "2024-01-29T10:00:00Z"
    }
  ]
}
```

**Response:**

```json
{
  "reply": "You can track your order by checking your email...",
  "intent": "orders"
}
```

## Customization

### Adding New Intents

Edit `/src/app/api/chatbot/route.ts`:

```typescript
const intentPatterns = {
  // Add new pattern
  warranty: /(warranty|guarantee|protection|coverage)/i,
};

// Add to knowledge base
const knowledgeBase = {
  warranty: "Warranty information...",
};
```

### Styling

The chatbot uses Alaba's brand colors (gradient #ffbf00 → #ff9500). Modify `chatbot.scss` to customize:

- Colors and gradients
- Animation speeds
- Message bubble styles
- Layout dimensions

### Integration with AI Services

To upgrade to AI-powered responses (OpenAI, Claude, etc.):

```typescript
// In /src/app/api/chatbot/route.ts
import { openai } from "@ai-sdk/openai";

const response = await openai.generateText({
  model: "gpt-4",
  messages: conversationHistory.map((msg) => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: msg.text,
  })),
});
```

## Usage

The chatbot is automatically integrated into the layout and appears on all pages:

1. Click the floating button in the bottom-right corner
2. Type your message
3. Press Enter or click Send
4. Get instant response

## Performance Considerations

- **Client-side caching**: Conversation history stored in component state
- **Lazy loading**: ChatBot component only renders on client side
- **Optimized API**: Response generation < 100ms for rule-based system
- **Responsive**: Adapts to mobile and desktop seamlessly

## Future Enhancements

Potential improvements:

- 🔄 Persistent conversation history (database storage)
- 🤖 AI integration (OpenAI GPT-4, Claude, etc.)
- 📊 Analytics and user feedback
- 🌍 Multi-language support
- 🔗 Integration with order management system
- 📞 Escalation to human agents
- 🎯 Product recommendations
- 📧 Email follow-ups

## Testing

To test the chatbot:

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click the chat button
4. Try various questions:
   - "Hello!"
   - "How do I track my order?"
   - "How do I become a seller?"
   - "What payment methods do you accept?"
   - "Tell me about returns"

## Support

For issues or feature requests related to the chatbot, contact the development team.
