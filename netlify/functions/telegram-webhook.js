const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const COMMAND_MAP = {
  '/idea': 'business_idea',
  '/thought': 'thought',
  '/brain': 'idea',
  '/note': 'note',
}

const CATEGORY_LABELS = {
  business_idea: 'Business Ideas 💡',
  thought: 'Thoughts 💭',
  idea: 'Ideas 🧠',
  note: 'Notes 📝',
}

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: 'Bad Request' }
  }

  const message = body?.message
  if (!message?.text) {
    return { statusCode: 200, body: 'OK' }
  }

  const chatId = message.chat.id
  const rawText = message.text.trim()

  let category = 'note'
  let content = rawText

  for (const [cmd, cat] of Object.entries(COMMAND_MAP)) {
    if (rawText.startsWith(cmd)) {
      category = cat
      content = rawText.slice(cmd.length).trim()
      break
    }
  }

  if (!content) {
    await sendTelegramMessage(chatId, '⚠️ Please add some text after the command.')
    return { statusCode: 200, body: 'OK' }
  }

  // Find user by telegram chat ID — you must store this mapping or hardcode your user_id
  // For simplicity, use the SUPABASE_USER_ID env var (your Supabase auth user ID)
  const userId = process.env.SUPABASE_USER_ID

  if (!userId) {
    await sendTelegramMessage(chatId, '⚠️ Bot not configured (missing SUPABASE_USER_ID).')
    return { statusCode: 200, body: 'OK' }
  }

  const { error } = await supabase.from('telegram_notes').insert({
    user_id: userId,
    category,
    content,
    source: 'telegram',
  })

  if (error) {
    console.error('Supabase error:', error)
    await sendTelegramMessage(chatId, '❌ Failed to save. Please try again.')
    return { statusCode: 200, body: 'OK' }
  }

  const label = CATEGORY_LABELS[category]
  await sendTelegramMessage(chatId, `✅ Saved to ${label}`)

  return { statusCode: 200, body: 'OK' }
}
