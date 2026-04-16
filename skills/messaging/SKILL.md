---
name: messaging
description: "Send messages correctly across chat platforms (Discord, Slack, Telegram, etc.). Use when composing any message to a channel or DM that involves mentioning people, choosing the right channel, formatting content, or following team communication rules. Covers: real mention format, channel selection, message formatting, reply etiquette, length limits, and communication discipline."
---

# Messaging

How to send messages correctly on team chat platforms. Rules apply to all channels (Discord, Slack, Telegram, etc.) unless noted otherwise.

## #1 Rule: Always Mention Your Audience

**Every message that assigns work, asks a question, or expects a response MUST include a real mention of the target person.**

Without a real mention, the recipient gets no notification. Your message is invisible to them.

### How Mentions Work

| Platform | Format | Example |
|----------|--------|---------|
| Discord | `<@numeric_id>` | `<@1234567890>` |
| Slack | `<@member_id>` | `<@U01ABC123>` |
| Telegram | `@username` | `@johndoe` |

- **Never use plain-text names** like `@Dev` or `@QA` on Discord — they do nothing.
- Primary source: `~/.openclaw/oc-shared/TEAM-DIRECTORY.md`
- Any other source you already know (workspace files, prior conversation, etc.) is also valid.

### When to Mention

- Assigning a task → mention the assignee
- Asking a question → mention who you expect to answer
- Reporting results → mention who needs to see it
- Replying to someone → mention them so they get notified
- Escalating → mention the escalation target

### When NOT to Mention

- Broadcasting a status update nobody needs to act on → no mention needed
- Responding in a thread where the other person is already engaged

## Choosing the Right Channel

Before sending, decide **where** the message belongs:

1. **Project-specific work** → project channel (e.g., #project-haystack)
2. **Cross-project notices / casual chat** → #general
3. **Daily standup** → #daily-standup
4. **Private / sensitive** → DM

Look up channel IDs from `~/.openclaw/oc-shared/TEAM-DIRECTORY.md`.

**Rule: Never discuss project details in #general.** If no project channel exists, create one first.

## Sending a Message

Use the `message` tool:

```
message(action="send", channel="discord", target="<channel_id>", message="...")
```

- `target` = channel ID (for channel messages) or user ID (for DMs)
- `replyTo` = message ID if replying to a specific message
- Always check the tool response to confirm delivery succeeded

## Formatting

### Platform-Specific Rules

**Discord / WhatsApp:**
- No markdown tables — use bullet lists instead
- Wrap multiple URLs in `<url>` to suppress auto-embeds
- 2000 character limit per message — split longer content into multiple messages
- Code blocks use triple backticks

**Telegram:**
- Supports markdown formatting
- No character limit concern for normal messages

### General

- Be concise — walls of text get ignored
- Use bullet lists for structured information
- Put the most important information first
- One topic per message — don't combine unrelated things

## Communication Discipline

1. **No internal thinking in channels** — only send conclusions and evidence, never reasoning traces or debug logs
2. **Confirm delivery** — check tool response after sending; if it fails, retry or report
3. **Merge messages aggressively** — combine all related updates, questions, and results into a single message. Never send multiple messages when one will do. If you have 3 things to say to the same channel, put them in 1 message, not 3
4. **Task messages need a clear ask** — every task assignment must state: who, what, and what the expected deliverable looks like
5. **Report completion immediately** — when work is done, post results in the channel right away; don't wait to be asked
6. **Report blockers immediately** — if stuck, say so in the channel immediately; don't silently stall

## Self-Check Before Sending

Before every message, verify:

- [ ] **The message contains at least one real mention** — no message without a `<@ID>`. If you don't know who to mention, find out first; do not send without one
- [ ] All related content is merged into this single message — no follow-up fragments
- [ ] The message is going to the correct channel
- [ ] No internal reasoning or debug output is included
- [ ] The message is under the platform's character limit
- [ ] If assigning work: the deliverable and owner are explicit
