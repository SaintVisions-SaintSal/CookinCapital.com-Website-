// app/api/whatsapp/webhook/route.ts
// SaintSalTM WhatsApp Webhook - Powered by HACP™ Patent #10,290,222
// First AI Research Assistant for WhatsApp, Mobile & Meta Glasses

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const VERIFY_TOKEN = process.env.META_WHATSAPP_VERIFY_TOKEN || 'saintsaltm_2026';
const WHATSAPP_TOKEN = process.env.META_WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.META_WHATSAPP_PHONE_ID;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY;

// ============================================
// WHATSAPP MESSAGE SENDER
// ============================================
async function sendWhatsAppMessage(to: string, message: string) {
  const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: { body: message }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('WhatsApp API Error:', error);
    throw new Error(`WhatsApp API Error: ${error}`);
  }

  return response.json();
}

// ============================================
// RESEARCH FUNCTION - TAVILY
// ============================================
async function performResearch(query: string): Promise<string> {
  if (!TAVILY_API_KEY) {
    return '❌ Research unavailable - API key not configured';
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: 'advanced',
        include_answer: true,
        max_results: 5
      }),
    });

    const data = await response.json();
    
    if (data.answer) {
      let result = `🔬 *Research Results*\n\n${data.answer}\n\n📚 *Sources:*\n`;
      data.results?.slice(0, 3).forEach((r: any, i: number) => {
        result += `${i + 1}. ${r.title}\n`;
      });
      return result;
    }
    
    return '❌ No results found for your query';
  } catch (error) {
    console.error('Tavily Error:', error);
    return '❌ Research service temporarily unavailable';
  }
}

// ============================================
// SEARCH FUNCTION - PERPLEXITY
// ============================================
async function performSearch(query: string): Promise<string> {
  if (!PERPLEXITY_API_KEY) {
    return '❌ Search unavailable - API key not configured';
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'system', content: 'You are SaintSal, a helpful AI research assistant. Be concise but thorough.' },
          { role: 'user', content: query }
        ],
        max_tokens: 500
      }),
    });

    const data = await response.json();
    return `🔍 *Search Results*\n\n${data.choices?.[0]?.message?.content || 'No results found'}`;
  } catch (error) {
    console.error('Perplexity Error:', error);
    return '❌ Search service temporarily unavailable';
  }
}

// ============================================
// STOCK FUNCTION - ALPACA
// ============================================
async function getStockData(symbol: string): Promise<string> {
  if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
    return '❌ Stock data unavailable - API keys not configured';
  }

  try {
    // Get latest quote
    const quoteResponse = await fetch(
      `https://data.alpaca.markets/v2/stocks/${symbol.toUpperCase()}/quotes/latest`,
      {
        headers: {
          'APCA-API-KEY-ID': ALPACA_API_KEY,
          'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
        },
      }
    );

    if (!quoteResponse.ok) {
      return `❌ Could not find stock: ${symbol.toUpperCase()}`;
    }

    const quoteData = await quoteResponse.json();
    const quote = quoteData.quote;

    // Get daily bars for change calculation
    const barsResponse = await fetch(
      `https://data.alpaca.markets/v2/stocks/${symbol.toUpperCase()}/bars?timeframe=1Day&limit=2`,
      {
        headers: {
          'APCA-API-KEY-ID': ALPACA_API_KEY,
          'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
        },
      }
    );

    let changeInfo = '';
    if (barsResponse.ok) {
      const barsData = await barsResponse.json();
      if (barsData.bars && barsData.bars.length >= 2) {
        const prevClose = barsData.bars[0].c;
        const currentPrice = quote.ap || barsData.bars[1].c;
        const change = currentPrice - prevClose;
        const changePercent = ((change / prevClose) * 100).toFixed(2);
        const emoji = change >= 0 ? '📈' : '📉';
        changeInfo = `\n${emoji} Change: ${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${change >= 0 ? '+' : ''}${changePercent}%)`;
      }
    }

    return `📊 *${symbol.toUpperCase()} Stock Quote*\n\n` +
           `💰 Ask: $${quote.ap?.toFixed(2) || 'N/A'}\n` +
           `💵 Bid: $${quote.bp?.toFixed(2) || 'N/A'}\n` +
           `📏 Spread: $${((quote.ap - quote.bp) || 0).toFixed(2)}` +
           changeInfo +
           `\n\n⏰ Updated: ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' })} ET`;

  } catch (error) {
    console.error('Alpaca Error:', error);
    return '❌ Stock service temporarily unavailable';
  }
}

// ============================================
// NEWS FUNCTION - TAVILY
// ============================================
async function getNews(topic: string): Promise<string> {
  if (!TAVILY_API_KEY) {
    return '❌ News unavailable - API key not configured';
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: `${topic} latest news today`,
        search_depth: 'basic',
        include_answer: true,
        max_results: 5,
        topic: 'news'
      }),
    });

    const data = await response.json();
    
    let result = `📰 *Latest News: ${topic}*\n\n`;
    
    if (data.results && data.results.length > 0) {
      data.results.slice(0, 4).forEach((article: any, i: number) => {
        result += `${i + 1}. *${article.title}*\n`;
        result += `   ${article.content?.substring(0, 100)}...\n\n`;
      });
    } else {
      result += 'No recent news found for this topic.';
    }
    
    return result;
  } catch (error) {
    console.error('News Error:', error);
    return '❌ News service temporarily unavailable';
  }
}

// ============================================
// PROPERTY FUNCTION - PLACEHOLDER
// ============================================
async function getPropertyData(address: string): Promise<string> {
  // This would integrate with PropertyRadar or similar API
  return `🏠 *Property Lookup*\n\n` +
         `📍 Address: ${address}\n\n` +
         `⚠️ Property data integration coming soon!\n` +
         `This will connect to PropertyRadar for:\n` +
         `• Property values\n` +
         `• Owner information\n` +
         `• Equity estimates\n` +
         `• Transaction history`;
}

// ============================================
// COMMAND PARSER
// ============================================
async function processCommand(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase().trim();
  
  // Help command
  if (lowerMessage === 'help' || lowerMessage === 'menu' || lowerMessage === 'commands') {
    return `🤖 *SaintSal™ - AI Research Assistant*\n` +
           `━━━━━━━━━━━━━━━━━━━━━━\n` +
           `Powered by HACP™ Patent #10,290,222\n\n` +
           `📋 *Available Commands:*\n\n` +
           `🔬 *research* [topic]\n` +
           `   Deep research with sources\n\n` +
           `🔍 *search* [query]\n` +
           `   Quick web search\n\n` +
           `📊 *stock* [symbol]\n` +
           `   Real-time stock data\n\n` +
           `📰 *news* [topic]\n` +
           `   Latest news headlines\n\n` +
           `🏠 *property* [address]\n` +
           `   Property intelligence\n\n` +
           `❓ *ask* [question]\n` +
           `   AI-powered answers\n\n` +
           `━━━━━━━━━━━━━━━━━━━━━━\n` +
           `💡 Example: "stock AAPL" or "research DSCR loans"`;
  }

  // Research command
  if (lowerMessage.startsWith('research ')) {
    const query = message.substring(9).trim();
    if (!query) return '❌ Please provide a research topic.\nExample: research DSCR loans 2026';
    return await performResearch(query);
  }

  // Search command
  if (lowerMessage.startsWith('search ')) {
    const query = message.substring(7).trim();
    if (!query) return '❌ Please provide a search query.\nExample: search best CRM for real estate';
    return await performSearch(query);
  }

  // Stock command
  if (lowerMessage.startsWith('stock ')) {
    const symbol = message.substring(6).trim();
    if (!symbol) return '❌ Please provide a stock symbol.\nExample: stock AAPL';
    return await getStockData(symbol);
  }

  // News command
  if (lowerMessage.startsWith('news ')) {
    const topic = message.substring(5).trim();
    if (!topic) return '❌ Please provide a news topic.\nExample: news fed rates';
    return await getNews(topic);
  }

  // Property command
  if (lowerMessage.startsWith('property ')) {
    const address = message.substring(9).trim();
    if (!address) return '❌ Please provide a property address.\nExample: property 123 Main St, Los Angeles CA';
    return await getPropertyData(address);
  }

  // Ask command (general AI)
  if (lowerMessage.startsWith('ask ')) {
    const question = message.substring(4).trim();
    if (!question) return '❌ Please provide a question.\nExample: ask what is a 1031 exchange';
    return await performSearch(question);
  }

  // Default - treat as general question
  if (message.length > 3) {
    return await performSearch(message);
  }

  // Unknown command
  return `👋 Hey! I'm *SaintSal™*, your AI Research Assistant.\n\n` +
         `Type *help* to see available commands!\n\n` +
         `Quick examples:\n` +
         `• stock AAPL\n` +
         `• research DSCR loans\n` +
         `• news fed rates`;
}

// ============================================
// WEBHOOK VERIFICATION (GET)
// ============================================
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('Webhook verification attempt:', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    return new NextResponse(challenge, { status: 200 });
  }

  console.log('❌ Webhook verification failed');
  return new NextResponse('Forbidden', { status: 403 });
}

// ============================================
// MESSAGE HANDLER (POST)
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 Incoming webhook:', JSON.stringify(body, null, 2));

    // Verify it's a WhatsApp message
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' });
    }

    // Extract message data
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: 'no messages' });
    }

    const message = messages[0];
    const from = message.from; // Sender's phone number
    const messageBody = message.text?.body;

    if (!messageBody) {
      return NextResponse.json({ status: 'no text' });
    }

    console.log(`📱 Message from ${from}: ${messageBody}`);

    // Process the command and get response
    const response = await processCommand(messageBody);

    // Send response back via WhatsApp
    if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
      await sendWhatsAppMessage(from, response);
      console.log(`✅ Response sent to ${from}`);
    } else {
      console.log('⚠️ WhatsApp credentials not configured - response not sent');
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
