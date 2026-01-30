// Knowledge base for rule-based chatbot responses
export const KNOWLEDGE_BASE = [
  // Greetings & Welcome
  {
    patterns: ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening", "howdy"],
    response: "Hello! 👋 Welcome to Alaba Marketplace. I'm here to help! What can I assist you with today?",
  },
  {
    patterns: ["how are you", "how's it going", "what's up", "hows you doing"],
    response: "I'm doing great, thanks for asking! 😊 Ready to help you with any questions about Alaba Marketplace. What do you need?",
  },
  {
    patterns: ["thanks", "thank you", "appreciate it", "thx", "thanks so much"],
    response: "You're welcome! 🙏 Happy to help. Is there anything else I can assist you with?",
  },
  {
    patterns: ["help", "support", "need help", "i need assistance", "can you help me"],
    response: "Of course! I'm here to help. 💪 You can ask me about:\n• Orders & Tracking\n• Shipping & Delivery\n• Payments\n• Returns & Refunds\n• Products & Sellers\n• Account Issues\nWhat do you need?",
  },

  // Shipping & Delivery - HIGHLY EXPANDED
  {
    patterns: ["shipping", "delivery", "how long", "track order", "where is my order", "delivery time", "track my package"],
    response:
      "📦 **Shipping & Delivery:**\n• Standard: 2-5 business days\n• Express: Next day available\n• Track your order in 'My Orders'\n• Free shipping on orders ₦5,000+\n• Nationwide coverage\n• Real-time tracking updates",
  },
  {
    patterns: ["free shipping", "shipping cost", "delivery fee", "shipping charges", "how much is shipping"],
    response:
      "📍 **Shipping Costs:**\n• FREE on orders ₦5,000+\n• Standard: ₦500-₦2,000\n• Express: ₦2,000-₦5,000\n• Remote areas: May apply additional fee\n• Check the shipping calculator at checkout!",
  },
  {
    patterns: ["where is my package", "package status", "order not arrived", "still in transit"],
    response:
      "🔍 **Track Your Package:**\n• Go to My Orders\n• Click on the order\n• See real-time tracking\n• Estimated delivery shown\nIf delayed by 7+ days, contact support immediately!",
  },
  {
    patterns: ["returns", "return policy", "refund", "money back", "not satisfied", "damaged", "wrong item", "broken item"],
    response:
      "♻️ **Returns & Refunds (7-Day Policy):**\n• Valid from delivery date\n• Item must be unused/original condition\n• Full refund or exchange option\n• Steps: My Orders → Item → Request Return\n• Refund in 3-5 business days\nDamaged? Contact support within 24hrs!",
  },
  {
    patterns: ["exchange", "replace", "swap", "change item", "different size", "different color"],
    response:
      "🔄 **Product Exchange:**\n• 7-day window from delivery\n• Item must be unused\n• Same/different product OK\n• Free shipping included\n• No extra charge!\nGo to My Orders → Select → Request Exchange",
  },
  {
    patterns: ["delivery address", "change address", "wrong address", "update delivery", "incorrect address"],
    response:
      "📍 **Changing Delivery Address:**\n✅ BEFORE Shipped: Easy edit\n❌ AFTER Shipped: Cannot change\n• Go to My Orders\n• Click Edit if available\n• Confirm new address\nIf shipped: Contact support ASAP!",
  },
  {
    patterns: ["express delivery", "fast shipping", "urgent delivery", "same day"],
    response:
      "⚡ **Express Delivery Available:**\n• Next-day delivery in major cities\n• Lagos, Abuja, Port Harcourt, Ibadan\n• Cost: ₦2,000-₦5,000\n• Order before 2 PM for next-day\n• Select at checkout",
  },
  {
    patterns: ["delivery areas", "where do you deliver", "service areas", "coverage"],
    response:
      "🗺️ **Delivery Coverage:**\n• Nationwide delivery\n• All 36 states + FCT\n• Rural & urban areas\n• Some remote areas: Extra fee\n• Enter your location at checkout to see cost",
  },

  // Payment - HIGHLY EXPANDED
  {
    patterns: ["payment", "pay", "card", "transfer", "bank", "how to pay", "payment method", "checkout"],
    response:
      "💳 **Payment Methods:**\n• Debit/Credit Cards (Visa, Mastercard, Verve)\n• Bank Transfer\n• Paystack Wallet\n• USSD codes\n• All 100% secure & encrypted ✅",
  },
  {
    patterns: ["card payment", "credit card", "debit card", "card checkout"],
    response:
      "🏦 **Card Payments:**\n• Visa, Mastercard, Verve accepted\n• 3D Secure encryption\n• Instant confirmation\n• Receipt emailed\n• Save card for faster checkout\nSecure & trusted! ✅",
  },
  {
    patterns: ["bank transfer", "wire transfer", "bank payment", "account number"],
    response:
      "🏦 **Bank Transfer:**\n• Transfer details at checkout\n• Include order number in description\n• Confirmation within 30 mins\n• 24/7 processing\n• No fees from us\nInstructions shown at checkout",
  },
  {
    patterns: ["wallet", "paystack", "digital wallet", "e-wallet"],
    response:
      "💰 **Paystack Wallet:**\n• Load with card/bank\n• Quick checkout\n• Earn rewards\n• Check balance anytime\n• Easy to manage\nPerfect for frequent buyers!",
  },
  {
    patterns: ["payment failed", "transaction declined", "payment not processed", "error during payment"],
    response:
      "❌ **Payment Issues:**\n• Check internet connection\n• Verify card details\n• Ensure sufficient funds\n• Try different card\n• Clear browser cache\nStill failing? Contact support!\n📧 support@alabamarket.com or WhatsApp",
  },
  {
    patterns: ["payment confirmation", "receipt", "invoice", "payment proof"],
    response:
      "📧 **Payment Receipt:**\n• Auto-sent to email\n• Check 'Promotions' folder\n• Also in My Orders\n• Download invoice anytime\n• Print for records\nNeed duplicate? Contact support!",
  },
  {
    patterns: ["refund status", "where is my refund", "pending refund", "refund not received"],
    response:
      "💸 **Refund Status:**\n• Standard: 3-5 business days\n• Check bank account\n• Verify payment method\n• Contact support if delayed 7+ days\n• Provide order number\n📧 Email: support@alabamarket.com",
  },

  // Orders - HIGHLY EXPANDED
  {
    patterns: ["order", "my order", "order status", "view order", "check order"],
    response:
      "📋 **View Your Orders:**\n• Dashboard → My Orders\n• See all past/current orders\n• Real-time status updates\n• Track packages\n• Download invoices\n• Return items if eligible",
  },
  {
    patterns: ["track order", "order tracking", "where is order", "order number"],
    response:
      "🔍 **Track Your Order:**\n• My Orders → Select order\n• See detailed tracking\n• Estimated delivery date\n• Carrier information\n• Status updates in real-time\nGet updates via email/SMS too!",
  },
  {
    patterns: ["cancel order", "cancel order", "stop order", "delete order"],
    response:
      "❌ **Canceling Orders:**\n• Only if NOT yet shipped\n• Full refund issued\n• Steps: My Orders → Cancel\n• Refund in 2-3 days\nAlready shipped? Use return instead!\n(7-day return window)",
  },
  {
    patterns: ["modify order", "change order", "update order", "add to order"],
    response:
      "✏️ **Modifying Orders:**\n• Before shipping: Full edit\n• After shipping: Cannot modify\n• Cancel & reorder alternative\n• Contact support for help\n⚠️ Act fast once order placed!\nShipping happens within 24 hours",
  },
  {
    patterns: ["order not received", "missing items", "incomplete order", "order lost"],
    response:
      "🚨 **Order Issues:**\n• Missing items? Check packaging\n• Not arrived after 7 days?\n• Contact support with proof\n• Provide order number\n• Investigation started\n• Replacement sent if confirmed\n📧 support@alabamarket.com",
  },

  // Account & Auth - HIGHLY EXPANDED
  {
    patterns: ["login", "sign in", "log in", "account access", "cannot login"],
    response:
      "🔐 **Login Help:**\n• Use email or phone number\n• Password case-sensitive\n• Forgot password? Click link\n• Check email for reset link\n• Still stuck? Contact support\n✅ Accounts are always secure!",
  },
  {
    patterns: ["forgot password", "reset password", "change password", "password recovery"],
    response:
      "🔑 **Password Reset:**\n• Click 'Forgot Password'\n• Enter registered email\n• Check email (check spam!)\n• Click reset link\n• Set new password\n• Login with new password\n🎉 You're back in!",
  },
  {
    patterns: ["create account", "sign up", "register", "new account"],
    response:
      "✍️ **Creating Account:**\n• Visit signup page\n• Enter email/phone\n• Verify email/phone\n• Create password\n• Complete profile (optional)\n• Start shopping! 🎉\nTakes less than 2 minutes",
  },
  {
    patterns: ["edit profile", "update profile", "change name", "update account"],
    response:
      "👤 **Edit Your Profile:**\n• Dashboard → Profile\n• Update name, email, phone\n• Change password\n• Add avatar\n• Manage preferences\n• Save changes\nChanges apply instantly!",
  },
  {
    patterns: ["email address", "change email", "update email", "verify email"],
    response:
      "📧 **Email Management:**\n• Go to Profile → Email\n• Add new email\n• Verify via confirmation link\n• Make primary if needed\n• Remove old email\n• Check spam folder if waiting\nEssential for order updates!",
  },
  {
    patterns: ["phone number", "change phone", "update phone", "verify phone"],
    response:
      "📱 **Phone Management:**\n• Profile → Phone Number\n• Add new number\n• Verify via SMS/call\n• Make primary\n• Remove old number\n• Used for order notifications",
  },
  {
    patterns: ["delete account", "close account", "deactivate", "remove account"],
    response:
      "🗑️ **Account Deletion:**\n• Permanent & irreversible\n• All data removed\n• Cannot undo!\n• Contact support first\n• Provide reason\n• Process takes 30 days\nMaybe we can help instead?",
  },
  {
    patterns: ["two factor", "2fa", "security", "verify", "verification"],
    response:
      "🔒 **Two-Factor Authentication:**\n• Extra security layer\n• Optional but recommended\n• Via email/SMS\n• Settings → Security\n• Enable 2FA\n• Get codes for login\n🛡️ Maximum protection!",
  },

  // Products - HIGHLY EXPANDED
  {
    patterns: ["products", "find product", "search", "where to buy", "looking for"],
    response:
      "🔍 **Finding Products:**\n• Use search bar (top)\n• Browse categories\n• Filter by price/rating\n• Sort by new/popular\n• View seller ratings\n• Read reviews first!\nMillion+ products available!",
  },
  {
    patterns: ["out of stock", "unavailable", "not available", "sold out"],
    response:
      "📦 **Out of Stock Items:**\n• Currently unavailable\n• Check back soon\n• Similar products shown\n• Click 'Notify Me' button\n• Get alerted when back\n• Won't lose the product!\nMost items back within 7 days",
  },
  {
    patterns: ["product quality", "is this good", "worth it", "quality check", "authentic"],
    response:
      "⭐ **Product Quality:**\n• Check seller ratings\n• Read real customer reviews\n• View product photos\n• 7-day return guarantee\n• Buy with confidence\n• Our top sellers verified\n✅ You're protected with us!",
  },
  {
    patterns: ["product price", "why so expensive", "price drop", "discount"],
    response:
      "💰 **Product Pricing:**\n• Competitive market rates\n• Prices vary by seller\n• Compare similar products\n• Use price filter\n• Check for active promotions\n• Coupons available\n🎁 Save more with loyalty rewards!",
  },
  {
    patterns: ["product size", "dimensions", "specifications", "size chart"],
    response:
      "📏 **Product Specs:**\n• Check product page\n• Detailed specs listed\n• Dimensions included\n• Material information\n• Size charts for clothing\n• Ask seller questions\nNot sure? Contact seller!",
  },
  {
    patterns: ["product warranty", "guarantee", "protection", "coverage"],
    response:
      "🛡️ **Warranty & Protection:**\n• Depends on product type\n• Check product page\n• Manufacturer warranty info\n• 7-day return window\n• Quality guarantee\n• Damage coverage\nProtected with every purchase!",
  },

  // Sellers - EXPANDED
  {
    patterns: ["seller", "vendor", "shop", "store owner", "become seller"],
    response:
      "🏪 **About Sellers:**\n• Verified merchants\n• Ratings visible\n• Reviews from buyers\n• Quality checked\n• Fast responses\n• Want to sell? Check signup page!\n💼 Join our marketplace!",
  },
  {
    patterns: ["seller rating", "review seller", "seller reviews", "trust seller"],
    response:
      "⭐ **Seller Ratings:**\n• Check seller profile\n• See average rating\n• Read buyer reviews\n• View response time\n• Check return policy\n• More stars = More trusted!\n📊 Most sellers rated 4.5+",
  },
  {
    patterns: ["seller shipping", "seller delivery", "seller returns"],
    response:
      "📦 **Seller Policies:**\n• Vary by seller\n• Check before buying\n• Shipping time shown\n• Return windows listed\n• Contact seller anytime\n• Always protected by us",
  },
  {
    patterns: ["contact seller", "message seller", "ask seller"],
    response:
      "💬 **Contact Sellers:**\n• Go to seller profile\n• Click 'Message' button\n• Ask about products\n• Request custom items\n• Negotiate bulk orders\n• Most reply within 2 hours\n• Be respectful & clear",
  },
  {
    patterns: ["seller not responding", "seller ignoring", "bad seller", "seller issue"],
    response:
      "⚠️ **Seller Problems:**\n• Document all chats\n• Take screenshots\n• Report to support\n• Provide evidence\n• We'll investigate\n• Your protection guaranteed\n• May result in seller penalties",
  },

  // Promotions & Offers - EXPANDED
  {
    patterns: ["discount", "coupon", "promo", "offer", "sale", "deals"],
    response:
      "🎁 **Discounts & Deals:**\n• Check Home page\n• Browse promotions\n• Use coupon codes\n• Some items % off\n• Limited time offers\n• Subscribe for alerts\n💝 Save daily with us!",
  },
  {
    patterns: ["flash sale", "limited deal", "special offer"],
    response:
      "⚡ **Flash Sales:**\n• Happens randomly\n• Check notifications\n• Limited quantities\n• Deep discounts\n• First come first served\n• Subscribe for alerts\n🔔 Turn on notifications!",
  },
  {
    patterns: ["loyalty", "rewards", "points", "cashback"],
    response:
      "🎯 **Loyalty Program:**\n• Earn points per purchase\n• Redeem for discounts\n• Exclusive member deals\n• Birthday bonus\n• Referral rewards\n• Build your score!\n✨ More purchases = More rewards",
  },
  {
    patterns: ["referral", "refer friend", "invite friend", "share earning"],
    response:
      "👥 **Referral Program:**\n• Share your code\n• Friend gets discount\n• You earn rewards\n• Unlimited earnings\n• Dashboard → Refer\n• Track referrals\n💰 Earn while helping!",
  },

  // Safety & Security - EXPANDED
  {
    patterns: ["safe", "secure", "fraud", "scam", "fake", "security"],
    response:
      "🔒 **Safety & Security:**\n• SSL encryption always\n• PCI DSS compliant\n• Buyer protection\n• Seller verification\n• Fraud monitoring 24/7\n• Report scams immediately\n✅ Your data is safe with us!",
  },
  {
    patterns: ["fake product", "counterfeit", "not original", "original check"],
    response:
      "⚠️ **Authentic Products:**\n• We verify sellers\n• Check ratings carefully\n• 7-day return policy\n• Suspected fake? Report\n• Get full refund\n• We take action on sellers\n• Photos help prove authenticity",
  },
  {
    patterns: ["payment safe", "secure checkout", "data protection", "privacy"],
    response:
      "🛡️ **Payment Security:**\n• 256-bit SSL encryption\n• PCI DSS Level 1\n• Secure payment gateway\n• No card data stored\n• Verified checkout\n• Never share passwords\n✅ Always secure!",
  },

  // Website Features - EXPANDED
  {
    patterns: ["wishlist", "save", "favorites", "bookmark"],
    response:
      "❤️ **Wishlist Feature:**\n• Click heart icon\n• Item saved\n• View anytime\n• Get notified on sale\n• Share with friends\n• Organize later\n💝 Never lose track of wants!",
  },
  {
    patterns: ["compare", "compare products", "product comparison"],
    response:
      "⚖️ **Compare Products:**\n• Select 2-3 items\n• Click Compare\n• Side-by-side view\n• Price comparison\n• Spec comparison\n• Ratings shown\n📊 Choose the best easily!",
  },
  {
    patterns: ["notifications", "alerts", "notify me", "subscribe"],
    response:
      "🔔 **Notifications:**\n• Go to Settings\n• Enable notifications\n• Choose preferences\n• Get order updates\n• Sale alerts\n• New arrivals\n• Manage anytime",
  },
  {
    patterns: ["app", "mobile app", "download app"],
    response:
      "📱 **Mobile App:**\n• iOS & Android available\n• Download from stores\n• Faster experience\n• Push notifications\n• Offline browsing\n• Exclusive app deals\n⭐ Rated 4.7+ stars!",
  },

  // Help & Support
  {
    patterns: ["contact support", "customer service", "help desk", "support team"],
    response:
      "📞 **Contact Support:**\n• 📧 Email: support@alabamarket.com\n• 💬 WhatsApp: [Link in app]\n• 🌐 Live chat: Available 9am-9pm\n• 📱 Phone: Available Mon-Fri\n• Response: Usually within 2 hours\n• We're here to help! 🤝",
  },
  {
    patterns: ["faq", "frequently asked", "common questions"],
    response:
      "❓ **FAQ Section:**\n• Browse common questions\n• Search for answers\n• Video tutorials\n• Step-by-step guides\n• Most issues solved here\n• Still need help? Contact support\n📚 Knowledge base available!",
  },
];

export const MATCH_THRESHOLD = 0.6; // 60% confidence required to answer
