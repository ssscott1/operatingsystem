export const journalPrompts = [
  "What's the one thing that would make today great? 🌟",
  "What are you grateful for this morning? 🙏",
  "What did you learn yesterday that you can apply today? 📚",
  "What's one small win you're chasing today? 🏆",
  "How are you going to show up today? 💪",
  "What would make you proud when you look back on today? ✨",
  "What's one thing you're excited about right now? 🔥",
  "Who can you add value to today, and how? 🤝",
  "What's one obstacle you're ready to push through? ⚡",
  "What energy do you want to bring to every interaction today? 🌊",
  "What's a belief you're choosing to reinforce today? 🧠",
  "If you were operating at your absolute best today, what would that look like? 🚀",
  "What's one habit you're committing to today? 🎯",
  "What's something you've been putting off that you can take one step toward today? 👣",
  "What does success look like for you at 9pm tonight? 🌙",
  "What's the story you're telling yourself today — and is it serving you? 💭",
  "What would your future self thank you for doing today? 🕰️",
  "What conversation have you been avoiding that you're ready to have? 🗣️",
  "What's one thing you can do today that your body will thank you for? 🏃",
  "What are three things you want to accomplish before the day is done? ✅",
]

export function getDailyPrompt() {
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  )
  return journalPrompts[dayOfYear % journalPrompts.length]
}
