/**
 * Cohort Month Color System
 * Consistent color palette for 8-month program
 * Colors are nature-inspired and tie to the Rogue theme
 */

export interface MonthColor {
  month: number
  name: string
  badge: string // For badges and small UI elements
  bg: string // For backgrounds
  border: string // For borders
  text: string // For text on white backgrounds
  lightBg: string // For subtle backgrounds
}

export const MONTH_COLORS: MonthColor[] = [
  {
    month: 1,
    name: 'Forest',
    badge: 'bg-rogue-forest text-white',
    bg: 'bg-rogue-forest',
    border: 'border-rogue-forest',
    text: 'text-rogue-forest',
    lightBg: 'bg-rogue-forest/10',
  },
  {
    month: 2,
    name: 'Gold',
    badge: 'bg-rogue-gold text-white',
    bg: 'bg-rogue-gold',
    border: 'border-rogue-gold',
    text: 'text-rogue-gold',
    lightBg: 'bg-rogue-gold/10',
  },
  {
    month: 3,
    name: 'Copper',
    badge: 'bg-rogue-copper text-white',
    bg: 'bg-rogue-copper',
    border: 'border-rogue-copper',
    text: 'text-rogue-copper',
    lightBg: 'bg-rogue-copper/10',
  },
  {
    month: 4,
    name: 'Pine',
    badge: 'bg-rogue-pine text-white',
    bg: 'bg-rogue-pine',
    border: 'border-rogue-pine',
    text: 'text-rogue-pine',
    lightBg: 'bg-rogue-pine/10',
  },
  {
    month: 5,
    name: 'Sky',
    badge: 'bg-blue-600 text-white',
    bg: 'bg-blue-600',
    border: 'border-blue-600',
    text: 'text-blue-600',
    lightBg: 'bg-blue-50',
  },
  {
    month: 6,
    name: 'Sage',
    badge: 'bg-rogue-sage text-white',
    bg: 'bg-rogue-sage',
    border: 'border-rogue-sage',
    text: 'text-rogue-sage',
    lightBg: 'bg-rogue-sage/10',
  },
  {
    month: 7,
    name: 'Stone',
    badge: 'bg-rogue-slate text-white',
    bg: 'bg-rogue-slate',
    border: 'border-rogue-slate',
    text: 'text-rogue-slate',
    lightBg: 'bg-rogue-slate/10',
  },
  {
    month: 8,
    name: 'Ember',
    badge: 'bg-orange-600 text-white',
    bg: 'bg-orange-600',
    border: 'border-orange-600',
    text: 'text-orange-600',
    lightBg: 'bg-orange-50',
  },
]

/**
 * Get color scheme for a specific month (1-8)
 */
export function getMonthColor(month: number): MonthColor {
  const color = MONTH_COLORS.find((c) => c.month === month)
  return color || MONTH_COLORS[0] // Default to Month 1 if not found
}

/**
 * Get color from month string (e.g., "Month 1: Personal Leadership")
 */
export function getMonthColorFromString(moduleTitle: string): MonthColor {
  const match = moduleTitle.match(/Month (\d+)/)
  if (match) {
    const monthNum = parseInt(match[1])
    return getMonthColor(monthNum)
  }
  return MONTH_COLORS[0] // Default to Month 1
}

