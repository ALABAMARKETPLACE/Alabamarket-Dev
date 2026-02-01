# OpenAI ChatBot Setup

## Prerequisites

Make sure you have the OpenAI package installed:

```bash
npm install openai
```

## Environment Setup

Add the following to your `.env.local` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk_your_actual_api_key_here
```

## Getting Your OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key and add it to your `.env.local` file
5. **IMPORTANT**: Never commit your API key to version control

## Recommended Setup

### Create .env.local (if it doesn't exist)

```bash
touch .env.local
```

### Add to .env.local

```env
OPENAI_API_KEY=sk_your_key_here
```

### Restart Dev Server

```bash
npm run dev
```

## Chatbot Features with OpenAI

✅ **Natural Language Understanding**: GPT-4 understands context and nuance
✅ **Conversational**: Maintains natural conversation flow
✅ **Smart Responses**: Contextually relevant answers
✅ **Nigerian Market Focused**: Trained on Alaba Marketplace specifics
✅ **Error Handling**: Graceful fallbacks if API fails
✅ **Rate Limiting**: Handles API rate limits gracefully

## API Model Configuration

The chatbot uses **GPT-4 Turbo** with these settings:

- **Model**: gpt-4-turbo
- **Max Tokens**: 500 (keeps responses concise)
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Top P**: 0.9 (natural diversity)

## Cost Estimation

OpenAI pricing (as of Jan 2026):

- **GPT-4 Turbo Input**: $0.01 per 1K tokens
- **GPT-4 Turbo Output**: $0.03 per 1K tokens

**Typical conversation**:

- User message: ~50 tokens = $0.0005
- Bot response: ~200 tokens = $0.006
- **Total per exchange**: ~$0.0065 (less than 1 cent!)

## Customization

### Adjust Response Tone

Edit the SYSTEM_PROMPT in `/src/app/api/chatbot/route.ts`:

```typescript
const SYSTEM_PROMPT = `You are Alaba Assistant...`;
```

### Change Model

Replace `"gpt-4-turbo"` with:

- `"gpt-4"` - Most capable, slower
- `"gpt-3.5-turbo"` - Faster, cheaper
- `"gpt-4-turbo"` - Best balance (recommended)

### Adjust Temperature

- `0.0` - Deterministic, consistent
- `0.7` - Balanced (current)
- `1.0` - Creative, varied

## Troubleshooting

### "API key not configured" Error

- Verify `.env.local` file exists
- Check key starts with `sk_`
- Restart dev server
- Verify key has not been regenerated

### "Rate limit exceeded" Error

- OpenAI limits requests per minute
- Chatbot handles this gracefully
- Message will suggest trying again

### Empty Responses

- Check OpenAI API status: https://status.openai.com
- Verify API key is active
- Check available credits on OpenAI dashboard

### Slow Responses

- GPT-4 takes 1-3 seconds
- Consider using gpt-3.5-turbo for faster responses
- This is normal behavior

## Performance Tips

1. **Cache Responses**: Store common Q&A in a database
2. **Use Cheaper Model**: Switch to gpt-3.5-turbo for cost savings
3. **Shorter Prompts**: Reduce system prompt length
4. **Batch Requests**: Don't overload with concurrent requests

## Monitoring

To see API calls in real-time:

```bash
# Check server logs
npm run dev
# Look for "[Chatbot]" messages
```

## Next Steps

1. ✅ Install openai package: `npm install openai`
2. ✅ Add OPENAI_API_KEY to .env.local
3. ✅ Restart dev server
4. ✅ Test chatbot with various questions
5. ✅ Monitor usage in OpenAI dashboard

## Security Best Practices

- ✅ Never commit .env.local to git
- ✅ Add .env.local to .gitignore (already done)
- ✅ Rotate API keys regularly
- ✅ Monitor unexpected usage
- ✅ Use environment variables, not hardcoded keys

---

**Questions?** Contact development team or check OpenAI docs: https://platform.openai.com/docs
