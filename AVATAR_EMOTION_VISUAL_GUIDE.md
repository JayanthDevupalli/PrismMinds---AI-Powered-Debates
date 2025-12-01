# Avatar Emotion Visual Reference

## Live Emotion Examples

### Persona A - Pro Advocate (Sky Blue)

#### 😤 Firm (Angry Tone)
```
Avatar: SkyBlue with RED glow ring
Pulse: Aggressive 1.08x scale animation
Badge: "😤 Firm" - Red colored
Voice: Faster rate (×1.3), Higher pitch (×1.4), Sharp delivery
Example: "That's absolutely ridiculous and nonsense!"
```

#### 🤩 Enthusiastic (Excited Tone)
```
Avatar: SkyBlue with YELLOW glow ring
Pulse: Dynamic 1.08x scale animation
Badge: "🤩 Enthusiastic" - Yellow colored
Voice: Fast rate (×1.25), Higher pitch (×1.35), Energetic
Example: "This is an incredible and fantastic opportunity!"
```

#### 😎 Confident (Cool Tone)
```
Avatar: SkyBlue with BLUE glow ring
Pulse: Steady 1.08x scale animation
Badge: "😎 Confident" - Blue colored
Voice: Slow rate (×0.95), Lower pitch (×0.95), Assured delivery
Example: "Clearly, this is undoubtedly the best approach."
```

#### 🤔 Analytical (Thoughtful Tone)
```
Avatar: SkyBlue with PURPLE glow ring
Pulse: Gentle 1.08x scale animation
Badge: "🤔 Analytical" - Purple colored
Voice: Very slow rate (×0.9), Normal pitch, Measured delivery
Example: "Perhaps we should consider, however, the data shows..."
```

#### 😏 Witty (Sarcastic Tone)
```
Avatar: SkyBlue with ORANGE glow ring
Pulse: Playful 1.08x scale animation
Badge: "😏 Witty" - Orange colored
Voice: Slightly fast rate (×1.05), Higher pitch (×1.15), Clever tone
Example: "Sure, of course that makes perfect sense?"
```

#### 😊 Neutral (Default)
```
Avatar: SkyBlue, No glow ring
Pulse: Subtle breath animation
Badge: None (or "😊 Neutral" if needed)
Voice: Standard rate (×1.0), Normal pitch
Example: "The answer to that question is straightforward."
```

---

### Persona B - Skeptic/Critic (Orange-Red)

#### 😤 Firm (Angry Tone)
```
Avatar: OrangeRed with RED glow ring
Pulse: Aggressive 1.08x scale animation
Badge: "😤 Firm" - Red colored (orange background)
Voice: Faster rate (×1.3), Higher pitch (×1.4), Sharp delivery
Example: "This argument is completely flawed and unacceptable!"
```

#### 🤩 Enthusiastic (Excited Tone)
```
Avatar: OrangeRed with YELLOW glow ring
Pulse: Dynamic 1.08x scale animation
Badge: "🤩 Enthusiastic" - Yellow colored (orange background)
Voice: Fast rate (×1.25), Higher pitch (×1.35), Energetic
Example: "What an amazing and brilliant counterpoint!"
```

#### 😎 Confident (Cool Tone)
```
Avatar: OrangeRed with BLUE glow ring
Pulse: Steady 1.08x scale animation
Badge: "😎 Confident" - Blue colored (orange background)
Voice: Slow rate (×0.95), Lower pitch (×0.95), Assured delivery
Example: "Definitely, that's without question the stronger position."
```

#### 🤔 Analytical (Thoughtful Tone)
```
Avatar: OrangeRed with PURPLE glow ring
Pulse: Gentle 1.08x scale animation
Badge: "🤔 Analytical" - Purple colored (orange background)
Voice: Very slow rate (×0.9), Normal pitch, Measured delivery
Example: "Let me alternatively consider, however, this perspective..."
```

#### 😏 Witty (Sarcastic Tone)
```
Avatar: OrangeRed with ORANGE glow ring
Pulse: Playful 1.08x scale animation
Badge: "😏 Witty" - Orange colored
Voice: Slightly fast rate (×1.05), Higher pitch (×1.15), Clever tone
Example: "Right, and I suppose that's your final argument?"
```

---

## Emotion Detection Keywords

### 🔴 Angry Keywords
- "ridiculous" | "nonsense" | "absurd" | "outrageous" | "unacceptable"
- "completely wrong" | "absolutely" (in negative context)
- Triggered by: Multiple strong negation words

### 🟡 Excited Keywords
- "incredible" | "amazing" | "brilliant" | "fantastic" | "wonderful"
- "excellent" | "thrilled" | "wonderful"
- Triggered by: Superlatives and positive descriptors

### 🔵 Cool/Confident Keywords
- "clearly" | "obviously" | "undoubtedly" | "definitely" | "certainly"
- "without question"
- Triggered by: Absolute, definitive language

### 🟣 Thoughtful/Measured Keywords
- "perhaps" | "maybe" | "consider" | "however" | "nonetheless"
- "alternatively" | "perspective"
- Triggered by: Conditional, exploratory language

### 🟠 Sarcastic Keywords
- "right" | "sure" | "yeah" | "of course" | "naturally" | "supposedly"
- Triggered by: These keywords + question mark ("?")
- Example: "Sure, that makes perfect sense?"

---

## Voice Parameter Ranges

### Rate Modifiers (Speech Speed)
- **Angry**: 1.3× (fast, sharp)
- **Excited**: 1.25× (energetic)
- **Cool**: 0.95× (deliberate)
- **Thoughtful**: 0.9× (measured)
- **Sarcastic**: 1.05× (playful)
- **Neutral**: 1.0× (normal)

### Pitch Modifiers (Voice Height)
- **Angry**: +0.4 (higher, intense)
- **Excited**: +0.35 (upbeat)
- **Cool**: -0.05 (lower, confident)
- **Thoughtful**: 0.0 (neutral)
- **Sarcastic**: +0.15 (light emphasis)
- **Neutral**: 0.0 (normal)

### Volume
- **All emotions except thoughtful**: 1.0 (full)
- **Thoughtful**: 0.95 (slightly softer for contemplative effect)

---

## Animation Behavior

### Avatar Pulse When Speaking
```
Scale: 1.0 → 1.08 → 1.0 (continuous cycle)
Duration: 1.4 seconds per cycle
Easing: smooth ease-in-out
Shadow: Gradually increases, then decreases
```

### Emotion Badge
```
Appears: When avatar starts speaking
Animation: Fade in (0ms) + slide up (smooth)
Disappears: When avatar stops speaking
Fade out: Smooth transition
```

### Glow Ring
```
Type: CSS ring (ring-* Tailwind classes)
Width: 2px (ring-2) for intense emotions, 1px (ring-1) for subtle
Color: Emotion-specific
Persistence: Only while speaking + emotion is active
```

---

## Accessibility Features

✅ **Emoji labels** provide visual emotion indicators for screen readers  
✅ **Color + pattern** combination (not just color) for colorblind users  
✅ **Text labels** ("Firm", "Confident", etc.) complement emoji  
✅ **ARIA attributes** on emotion badges for semantic meaning  
✅ **Fallback speech synthesis** works without visual emotion display  

---

## Performance Notes

- **Emotion detection**: O(1) string matching, <1ms per message
- **Voice config lookup**: O(1) switch statement, <1ms
- **Avatar animations**: GPU-accelerated via Framer Motion, smooth 60fps
- **No re-renders**: Emotion state memoized, only updates on message change
- **Memory efficient**: No additional DOM elements (CSS-only styling)

---

## Testing Checklist

- [ ] Test each emotion detection keyword
- [ ] Verify glow ring appears/disappears with speech
- [ ] Check emotion badge displays correct emoji
- [ ] Confirm voice rate/pitch changes on browser dev tools
- [ ] Test on mobile (smaller screens)
- [ ] Test with screen reader
- [ ] Verify no jank during rapid emotion changes
- [ ] Check animations on low-end devices
