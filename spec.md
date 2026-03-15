# Chess Game

## Current State
The app has a full chess game with:
- vs Player (PvP) mode and vs Computer (PvC) mode with 6 difficulty levels
- ModeSelector modal shown at startup
- AI using minimax algorithm with 3-second delay
- Announcement panel system
- The ModeSelector IS functional, the user may not have seen it properly

## Requested Changes (Diff)

### Add
- "Chat WhatsAppeando" section at the bottom of the page, styled like WhatsApp
- Camera panel: shows live camera preview using browser MediaDevices API
- Audio: record and send voice notes using MediaRecorder API
- Text message input and send button
- Chat messages displayed in a scrollable bubble list (local only, stored in state)
- Camera toggle button and audio recording button in the chat toolbar
- Emoji support in messages (basic, via text input)

### Modify
- Ensure ModeSelector works correctly and shows vs Computer option and 6 difficulty levels clearly
- Keep existing chess game fully functional above the chat section

### Remove
- Nothing

## Implementation Plan
1. Create `WhatsappChat.tsx` component with:
   - WhatsApp-green header "Chat WhatsAppeando"
   - Scrollable message list area with chat bubbles
   - Camera toggle that shows live video stream preview
   - Audio record button (hold to record or toggle)
   - Text input + send button
   - Messages stored in local React state with timestamps
2. Add the component below the footer in App.tsx
3. Keep ModeSelector intact
