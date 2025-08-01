# Imprimerie Grégoire - Brand Guidelines

## Brand Identity
**Company**: Imprimerie Grégoire  
**Industry**: Printing & Publishing Services  
**Design System**: Inspired by Uber's Base Web Design System  

## Color Palette

### Primary Brand Colors
- **Primary Green**: `hsl(106, 31%, 47%)` - #5a7a51
  - Main brand color representing nature, growth, and reliability
  - Usage: Primary buttons, links, focus states, brand elements
- **Primary Foreground**: `hsl(210, 40%, 98%)` - Light text on primary backgrounds

### Semantic Status Colors
- **Success/Positive**: `hsl(82, 84%, 47%)` - Success green
- **Warning**: `hsl(25, 100%, 50%)` - Warning orange
- **Error/Destructive**: `hsl(0, 84%, 60%)` - Error red
- **Info**: `hsl(217, 91%, 60%)` - Info blue

### Neutral Palette
- **Background**: `hsl(0, 0%, 100%)` - Pure white
- **Foreground**: `hsl(222.2, 84%, 4.9%)` - Almost black text
- **Muted**: `hsl(210, 40%, 96.1%)` - Subtle backgrounds
- **Muted Foreground**: `hsl(215.4, 16.3%, 46.9%)` - Secondary text
- **Border**: `hsl(214.3, 31.8%, 91.4%)` - Consistent boundaries

### Sidebar Theme
- **Sidebar Background**: `hsl(0, 0%, 98%)` - Off-white
- **Sidebar Primary**: `hsl(107, 20%, 40%)` - Darker green variant
- **Sidebar Border**: `hsl(220, 13%, 91%)` - Subtle borders

### Dark Mode Support
- All colors have dark mode variants with proper contrast ratios
- Maintains accessibility standards across themes

## Typography Scale

### Base Web Inspired Font Sizes
- **Caption**: 0.75rem (12px) - `--font-size-100`
- **Body Small**: 0.875rem (14px) - `--font-size-200`
- **Body**: 1rem (16px) - `--font-size-300`
- **Body Large**: 1.125rem (18px) - `--font-size-400`
- **Heading Small**: 1.25rem (20px) - `--font-size-550`
- **Heading Medium**: 1.5rem (24px) - `--font-size-650`
- **Heading Large**: 1.875rem (30px) - `--font-size-750`
- **Display Small**: 2.25rem (36px) - `--font-size-950`
- **Display Medium**: 2.75rem (44px) - `--font-size-1050`
- **Display Large**: 3.25rem (52px) - `--font-size-1150`

### Typography Rules
- **Line Height**: 1.2 for headings (tight leading)
- **Font Weight**: 600 for headings (semibold)
- **Letter Spacing**: -0.025em for headings (tighter tracking)
- **Font Smoothing**: Antialiased rendering for crisp text

## Spacing System

### 8px Base Unit System
- **100**: 0.25rem (4px) - `--spacing-100`
- **200**: 0.5rem (8px) - `--spacing-200`
- **300**: 0.75rem (12px) - `--spacing-300`
- **400**: 1rem (16px) - `--spacing-400`
- **500**: 1.25rem (20px) - `--spacing-500`
- **600**: 1.5rem (24px) - `--spacing-600`
- **700**: 2rem (32px) - `--spacing-700`
- **800**: 2.5rem (40px) - `--spacing-800`
- **900**: 3rem (48px) - `--spacing-900`
- **1000**: 4rem (64px) - `--spacing-1000`

## Component Guidelines

### Buttons
- **Primary**: Green background, white text, main actions
- **Secondary**: Subtle background, muted text, secondary actions
- **Tertiary**: Transparent background, primary text, low emphasis
- **Destructive**: Red background, white text, dangerous actions
- **Outline**: Border only, transparent background
- **Ghost**: No background, minimal visual weight

### Button Sizes
- **Mini**: Compact spacing, small text
- **Default**: Standard sizing for most use cases
- **Small**: Reduced padding
- **Compact**: Minimal height
- **Large**: Increased padding and text
- **Icon**: Square aspect ratio for icon-only buttons

### Badges
- **Default**: Primary green background
- **Secondary**: Muted background
- **Destructive**: Red background for errors
- **Outline**: Border-only variant

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Minimum Touch Targets**: 44px (mobile) / 40px (desktop)
- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Focus States**: 2px ring with primary color offset
- **Screen Reader Support**: Proper ARIA labels and roles

### Interactive Elements
- All buttons and links have proper focus indicators
- Keyboard navigation supported throughout
- Clear visual hierarchy with proper heading structure

## Mobile-First Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Responsive Principles
- Touch-friendly target sizes on mobile
- Optimized content density per screen size
- Progressive enhancement approach

## Brand Voice & Visual Identity

### Logo Usage
- **File**: `logo-imprimerie-gregoire.png`
- **Placement**: Top-left in applications
- **Sizing**: Responsive scaling (16-24px height)

### Language Tone
- Professional yet approachable
- Clear and direct communication
- French language primary

## Implementation Guidelines

### CSS Custom Properties
All design tokens are defined as CSS custom properties in `src/index.css`:
```css
:root {
  --primary: 106 31% 47%;
  --font-size-300: 1rem;
  --spacing-400: 1rem;
}
```

### Component Usage
- Use semantic design tokens instead of hardcoded values
- Leverage component variants for consistent styling
- Maintain design system integrity across features

### Development Best Practices
- Always use HSL color format
- Reference spacing tokens for consistent layouts
- Utilize typography scale for text hierarchy
- Implement proper dark mode support

---

*This brand guide ensures consistent visual identity and user experience across all Imprimerie Grégoire digital touchpoints while maintaining accessibility and usability standards.*