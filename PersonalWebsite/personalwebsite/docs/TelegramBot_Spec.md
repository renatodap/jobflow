# Telegram Bot Specification

## Bot Info
- **Name:** AI-Daily Bot
- **Username:** @RenatoDailyAIBot
- **Token:** `ENV_REQUIRED(TELEGRAM_BOT_TOKEN)`
- **Owner Chat ID:** `ENV_REQUIRED(TELEGRAM_CHAT_ID)`

## Commands

### User Commands
```
/start - Welcome message and bot overview
/help - List all available commands
/buffer - Check current content buffer status
/metrics - Today's performance metrics
/approve [id] - Approve specific content by ID
/tweak [id] [notes] - Request tweaks with notes
/decline [id] - Decline and recycle in 14 days
/hold - Hold all publishing for today
/rush [id] - Rush publish specific content
```

### Admin Commands
```
/scout - Trigger immediate content discovery
/regenerate [id] - Regenerate specific brief
/stats - Detailed system statistics
/logs - Recent error logs
/test - Send test approval message
```

## Inline Keyboards

### Approval Message
```json
{
  "inline_keyboard": [
    [
      {"text": "✅ Approve", "callback_data": "approve_{{ID}}"},
      {"text": "✏️ Tweak", "callback_data": "tweak_{{ID}}"}
    ],
    [
      {"text": "❌ Decline", "callback_data": "decline_{{ID}}"},
      {"text": "📊 View Details", "url": "https://renatodap.me/admin/{{ID}}"}
    ]
  ]
}
```

### Buffer Warning
```json
{
  "inline_keyboard": [
    [
      {"text": "🚀 Scout More", "callback_data": "scout_urgent"},
      {"text": "♻️ Recycle Old", "callback_data": "recycle_top"}
    ]
  ]
}
```

## Callback Handlers

### approve_{{ID}}
1. Mark content as approved in database
2. Add to publishing queue
3. Update buffer count
4. Send confirmation: "✅ Approved! Publishing at [TIME]"

### tweak_{{ID}}
1. Set status to "needs_tweak"
2. Prompt for tweak notes
3. Trigger regeneration with notes
4. Send new version for approval

### decline_{{ID}}
1. Mark as declined
2. Schedule for recycling in 14 days
3. Trigger immediate scout if buffer <2
4. Send confirmation: "Declined. Will recycle with new angle."

## Message Formats

### Daily Approval
```
📅 AI-Daily Approval
[DATE] • Buffer: X days

📱 Instagram: [TITLE]
📝 Blog: [TITLE]
🐦 X Hooks: A/B ready

Quality: XX/100 • Similarity: XX%

[Inline Keyboard]
```

### Metrics Report
```
📊 Today's Performance

Blog: XXX views (↑XX%)
IG: XX saves, XX shares
X: XXXX impressions
Best performer: [TITLE]

Tomorrow: X posts ready
```

### Buffer Alert
```
⚠️ Buffer Low: X days

Recommended actions:
• Run emergency scout
• Lower quality threshold
• Recycle top performers

[Inline Keyboard]
```

## Error Handling
- Invalid commands: "Unknown command. Try /help"
- Failed approval: "Error processing. Try email approval."
- API errors: Log and notify admin
- Rate limits: Queue messages, retry after 30s

## Security
- Verify chat_id matches owner
- Ignore messages from groups
- Log all commands with timestamps
- Rate limit: 30 commands/minute

## Webhooks
Set webhook: `https://n8n-instance.com/webhook/telegram-bot`
- Receive all updates via POST
- Process in n8n workflow
- Respond within 5 seconds