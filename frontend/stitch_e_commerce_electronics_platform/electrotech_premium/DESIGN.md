---
name: ElectroTech Premium
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424656'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727687'
  outline-variant: '#c2c6d8'
  surface-tint: '#0054d6'
  primary: '#0050cb'
  on-primary: '#ffffff'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#b3c5ff'
  secondary: '#515f78'
  on-secondary: '#ffffff'
  secondary-container: '#d2e0fe'
  on-secondary-container: '#55637d'
  tertiary: '#00636a'
  on-tertiary: '#ffffff'
  tertiary-container: '#007e86'
  on-tertiary-container: '#e3fdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#b9c7e4'
  on-secondary-fixed: '#0d1c32'
  on-secondary-fixed-variant: '#39475f'
  tertiary-fixed: '#7df4ff'
  tertiary-fixed-dim: '#00dbe9'
  on-tertiary-fixed: '#002022'
  on-tertiary-fixed-variant: '#004f54'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  electric-blue: '#0066FF'
  deep-navy: '#0A192F'
  cyber-cyan: '#00F0FF'
  surface-border: rgba(10, 25, 47, 0.08)
  glass-bg: rgba(255, 255, 255, 0.7)
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  spec-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-desktop: 80px
  container-padding-mobile: 20px
  gutter: 32px
  section-gap: 120px
---

## Brand & Style

This design system elevates the technological foundation of the brand into a high-end, premium territory. The personality is cutting-edge, authoritative, and sophisticated, targeting a demographic that appreciates engineering excellence as much as aesthetic refinement. 

The aesthetic is a hybrid of **Minimalism** and **Glassmorphism**, moving away from flat, functional surfaces toward a more dimensional, atmospheric interface. The UI should feel like a precision instrument—clean and professional, yet infused with a "vibrant tech" energy through light-emitting colors and soft, layered depth. Generous whitespace is used strategically to signify luxury and allow complex technical information to breathe.

## Colors

The palette shifts from standard corporate blues to a high-contrast, "Electric" tech scheme.

- **Primary (Electric Blue):** A vibrant, high-saturation blue used for primary actions and brand emphasis. For primary buttons, apply a subtle linear gradient from `primary_color_hex` to a slightly deeper shade (#0052CC) at a 135-degree angle.
- **Secondary (Deep Navy):** Used for typography, navigation backgrounds, and high-contrast accents to ground the vibrant primary blue.
- **Tertiary (Cyber Cyan):** A highlight color used sparingly for data visualization, success states, or subtle glows.
- **Neutral:** A crisp, cool-toned series of whites and grays that prioritize "Surface-Container" separation.
- **Gradient Usage:** Use subtle mesh gradients in backgrounds (15% opacity) to create the signature premium tech feel.

## Typography

The typography maintains the systematic clarity of **Inter** but introduces a more dramatic scale and increased line height for a high-end editorial feel.

- **Scale:** Headlines are slightly larger with tighter letter-spacing to create a "locked-in," professional appearance.
- **Hierarchy:** Use `deep-navy` for all primary headlines to ensure maximum readability against white or glass surfaces. Use a 60% opacity of `deep-navy` for secondary body text.
- **Micro-copy:** Labels and technical specs (`spec-data`) use increased letter-spacing and Medium to Semi-Bold weights to maintain legibility at small sizes within dense data environments.

## Layout & Spacing

The layout philosophy is based on a **fixed-grid** system for desktop to maintain a controlled, gallery-like presentation of technology.

- **Grid:** A 12-column grid with a max-width of 1440px. Gutters are increased to 32px to reinforce the "premium" sense of space.
- **Spacing Rhythm:** An 8px linear scale is used for all internal component spacing (8, 16, 24, 32, 48, 64).
- **Mobile:** Transitions to a 4-column grid with 20px side margins. Vertical spacing between sections should remain generous (min 64px) to avoid a cluttered "budget" feel.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and **Soft Shadows**, creating a multi-layered interface that feels light and modern.

- **Surface Layers:** Main content areas use a "Surface-Bright" white. Overlays, navigation bars, and modals utilize a semi-transparent blur (`backdrop-filter: blur(20px)`) with a very subtle 1px inner border (`surface-border`).
- **Shadow Profile:** Shadows are extremely diffused and multi-layered. Use a "Soft Tech" shadow: `0 10px 40px -10px rgba(10, 25, 47, 0.08)`.
- **Contrast:** Increase contrast between the background (`neutral_color_hex`) and cards by using the 1px subtle border instead of heavy fills.

## Shapes

The design system adopts a **Rounded** language (8px to 12px) to soften the technical edge and make the brand feel more accessible and modern.

- **Base Radius:** 8px for smaller components like inputs and small buttons.
- **Large Radius:** 16px (rounded-lg) for product cards and main containers.
- **Extra Large:** 24px (rounded-xl) for large promotional banners or featured sections.
- **Interactive:** Pill shapes are reserved exclusively for status indicators and tags to provide a distinct shape-contrast against structural elements.

## Components

### Buttons
Primary buttons feature the Electric Blue gradient with a soft shadow of the same hue (bloom effect). Secondary buttons use a ghost style with a 1px `deep-navy` border and 12px corner radius.

### Cards
Product and info cards must use `rounded-lg` (16px) corners. They feature a white background, the "Soft Tech" shadow, and a 1px border. On hover, the border color transitions to `primary_color_hex` and the shadow deepens slightly.

### Glass Modals
Modals must use the `glass-bg` variable with a 40px backdrop blur. The border should be a light 1px stroke of white (20% opacity) to catch the "light" at the edges.

### Form Fields
Inputs are minimal: white background, 8px radius, and a 1px border. On focus, the border turns `primary_color_hex` and gains a 4px soft outer glow (10% opacity blue).

### Lists & Navigation
Navigation items use `label-lg` with `deep-navy`. The active state is indicated by a short, 3px thick horizontal pill-bar in `primary_color_hex` centered beneath the text.