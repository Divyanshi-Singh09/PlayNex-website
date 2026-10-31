# PlayNex — Human-centered motion system

## Guiding principles

**Warm in feeling. Serious in thinking.** The navigation remains light, calm, predictable and centered on the real PlayNex logo. Animation reinforces a feeling of companionship, without competing with navigation or content.

**Whitespace first.** Blue acts as the dominant product/technology color. Aqua and green provide quieter support. Sunlight/coral are reserved for small warm highlights, as described in the official guide.

**A website that respects people.** No forced autoplay audio, no motion required to read content, no fabricated product price/certification, no misleading fake order interaction. Forms explain what they do. All ages are treated respectfully, without infantilizing typography or imagery.

## Motion language

- Orbital circles: slow ambient movement, 28–45s per rotation.
- Glass cards: soft bobbing, 5s loops with subtle movement.
- Companion illustration: 7s gentle float, never a distracting bounce.
- Cards: 7–9px hover lift with light shadow.
- Scroll entrances: 0.75s controlled upward motion with IntersectionObserver.
- Demo messages: fast 0.5s entrance when switching prompt.
- System preferences: `prefers-reduced-motion` disables continual and scroll animations.

## Design tokens

All colors and major components are in `app/globals.css`, including `--blue`, `--aqua`, `--green`, `--sun`, `--coral`, `--ink`, `--navy`, `--muted`, `--line`, and `--font`.

## Logo handling

The approved supplied logo is preserved at full resolution in `public/images/playnex-original-logo.png`; masthead PNG crops use the same pixels as the provided artwork. Use the complete original image at a sufficiently large size whenever the descriptor/tagline must be legible. A dedicated approved vector compact lockup should replace the cropped masthead asset before a final brand-signoff.

## Future product imagery

Visuals currently represent a friendly conceptual companion using CSS. Replace with 360° spins, edited macro material details and genuine product interaction video when approved. Reserve high-intensity animations for focus sections rather than every paragraph. All real claims must be validated by the product team.
