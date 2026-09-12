---
name: ElectroTech
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
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#8e3c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#b54e00'
  on-tertiary-container: '#ffece5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  spec-code:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 16px
  max-width: 1280px
---

## Brand & Style
The design system is engineered for high-performance e-commerce, targeting tech-savvy consumers who value precision and reliability. The visual language follows a **Modern Corporate** aesthetic with a strong emphasis on **Minimalism** and clarity.

The core objective is to reduce cognitive load during complex technical comparisons. This is achieved through generous white space, a structured information hierarchy, and high-quality product imagery. The emotional response should be one of competence and technological sophistication. Surfaces are clean, and the interface remains functional yet premium, avoiding unnecessary ornamentation in favor of data-driven layouts.

## Colors
This design system utilizes a palette rooted in "Digital Blue" to establish trust and authority. 

- **Primary (Digital Blue):** Used for primary actions, active states, and brand-critical navigation elements.
- **Secondary (Sleek Slate):** Utilized for supporting text, icons, and less prominent UI elements to maintain a neutral professional tone.
- **Accent (Innovation Orange):** Reserved strictly for Call-to-Action (CTA) buttons, promotional banners, and urgent notifications to ensure high conversion visibility.
- **Neutrals:** A range of cool grays (Slate) provides the foundation for backgrounds, borders, and dividers, ensuring a clean separation between content blocks.

## Typography
The system uses **Inter** across all levels to maintain a systematic and utilitarian feel. The hierarchy is designed to prioritize technical specs and product names.

- **Headlines:** Use Semi-Bold to Bold weights with tight letter-spacing for a modern, impactful look.
- **Product Specs:** Use the `spec-code` role for technical data points (e.g., "16GB RAM"), ensuring high legibility in dense tables.
- **Scaling:** On mobile, display and large headline sizes scale down significantly to prevent awkward word breaks in narrow viewports.

## Layout & Spacing
The design system employs a **12-column fluid grid** for desktop environments with a maximum width of 1280px.

- **Desktop:** 24px gutters with 64px outer margins to provide "breathing room" for premium product photography.
- **Tablet (768px - 1024px):** 8-column grid with 16px gutters.
- **Mobile (Below 768px):** 4-column grid with 16px margins. Content typically stacks vertically, with horizontal scrolling allowed for product carousels.
- **Rhythm:** All spacing (padding, margins) must be a multiple of the 4px base unit to ensure visual alignment and vertical rhythm.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Base Level:** The primary background uses `neutral-50` (#f8fafc).
- **Surface Level:** Product cards and containers use a pure white background with a 1px border (#e2e8f0).
- **Interactive Elevation:** Upon hover, elements transition to a subtle ambient shadow (0px 4px 12px rgba(0,0,0,0.05)) and a slightly darker border. This provides clear feedback without breaking the minimalist aesthetic.
- **Overlays:** Modals and dropdown menus use a more pronounced diffused shadow to separate them from the main content plane.

## Shapes
This design system utilizes a **Soft** shape language.

- **Standard Elements:** 0.25rem (4px) corner radius for buttons and input fields to maintain a precise, professional look.
- **Containers:** 0.5rem (8px) for product cards and metric cards to provide a subtle modern softening.
- **Badges:** Fully rounded (pill-shaped) for status indicators to contrast against the more structured rectangular layout of the data.

## Components

### Product Cards
Cards feature a white background with a 1px slate-200 border. Images should be centered on a light gray or white background. The "Innovation Orange" accent is used only for the primary "Add to Cart" button on hover.

### Navigation
The navigation is a multi-level megamenu. Top-level categories use `label-md` styling. Active states are indicated by a 2px "Digital Blue" bottom border.

### Data Tables & Status Badges
Tables use a strict horizontal grid with `spec-code` typography for row data. Status badges (e.g., "In Stock", "Out of Stock") use a "Pill" shape with low-saturation background tints and high-contrast text.

### Metric Cards & Sparklines
Metric cards (used in comparison or dashboard views) utilize `headline-md` for the primary value. Sparklines should be rendered in "Digital Blue" with a 2px stroke width, maintaining a clean, non-filled line.

### Form Inputs
Inputs use a 1px `border-color-hex` stroke. On focus, the border color transitions to `primary_color_hex` with a 2px outer glow (ring) of 20% opacity blue. Labels are positioned above the field using `label-md`.

### Buttons
- **Primary:** Innovation Orange (#f97316) background with white text.
- **Secondary:** White background with Digital Blue (#2563eb) border and text.
- **Ghost:** Transparent background with Sleek Slate (#64748b) text for utility actions.