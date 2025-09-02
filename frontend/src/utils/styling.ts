/**
 * Styling utility functions and consistent class patterns for the application
 * Ensures proper dark mode support and responsive design across all pages
 */

// Background classes for different contexts
export const backgrounds = {
  // Main page backgrounds
  page: 'bg-white dark:bg-gray-900',
  pageAlt: 'bg-gray-50 dark:bg-gray-800',
  
  // Section backgrounds
  section: 'bg-white dark:bg-gray-900',
  sectionAlt: 'bg-gray-50 dark:bg-gray-800',
  sectionDark: 'bg-gray-900 dark:bg-gray-950',
  
  // Card/Surface backgrounds
  card: 'bg-white dark:bg-gray-800',
  cardHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
  cardElevated: 'bg-white dark:bg-gray-700',
  
  // Special surfaces
  surface: 'bg-white dark:bg-gray-800',
  surfaceLight: 'bg-gray-50 dark:bg-gray-700',
  surfaceDark: 'bg-gray-100 dark:bg-gray-900',
  
  // Overlays
  overlay: 'bg-white/10 dark:bg-black/20',
  overlayDark: 'bg-black/50 dark:bg-black/70',
}

// Text color classes
export const textColors = {
  // Primary text colors
  primary: 'text-gray-900 dark:text-white',
  secondary: 'text-gray-600 dark:text-gray-300',
  muted: 'text-gray-500 dark:text-gray-400',
  light: 'text-gray-400 dark:text-gray-500',
  
  // Inverted text (for dark backgrounds in light mode)
  inverted: 'text-white',
  invertedSecondary: 'text-gray-200',
  invertedMuted: 'text-gray-300',
  
  // Brand colors
  brand: 'text-purple-600 dark:text-purple-400',
  brandHover: 'hover:text-purple-700 dark:hover:text-purple-300',
  
  // Link colors
  link: 'text-blue-600 dark:text-blue-400',
  linkHover: 'hover:text-blue-700 dark:hover:text-blue-300',
  
  // Status colors
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
}

// Border classes
export const borders = {
  // Default borders
  default: 'border-gray-200 dark:border-gray-700',
  light: 'border-gray-100 dark:border-gray-800',
  dark: 'border-gray-300 dark:border-gray-600',
  
  // Focus states
  focus: 'focus:border-purple-500 dark:focus:border-purple-400',
  focusRing: 'focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400',
  
  // Dividers
  divider: 'divide-gray-200 dark:divide-gray-700',
  dividerLight: 'divide-gray-100 dark:divide-gray-800',
}

// Shadow classes
export const shadows = {
  sm: 'shadow-sm',
  default: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  none: 'shadow-none',
  
  // Hover shadows
  hoverSm: 'hover:shadow-md',
  hoverMd: 'hover:shadow-lg',
  hoverLg: 'hover:shadow-xl',
  
  // Dark mode adjusted shadows (less prominent)
  darkSm: 'dark:shadow-sm dark:shadow-gray-950/50',
  darkMd: 'dark:shadow-md dark:shadow-gray-950/50',
  darkLg: 'dark:shadow-lg dark:shadow-gray-950/50',
}

// Button styles
export const buttons = {
  // Primary button
  primary: `
    bg-purple-600 dark:bg-purple-500 
    text-white 
    hover:bg-purple-700 dark:hover:bg-purple-600 
    focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 
    focus:ring-offset-2 dark:focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `,
  
  // Secondary button
  secondary: `
    bg-gray-200 dark:bg-gray-700 
    text-gray-900 dark:text-white 
    hover:bg-gray-300 dark:hover:bg-gray-600 
    focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400
    focus:ring-offset-2 dark:focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `,
  
  // Outline button
  outline: `
    border border-gray-300 dark:border-gray-600 
    bg-transparent 
    text-gray-700 dark:text-gray-300 
    hover:bg-gray-50 dark:hover:bg-gray-800 
    focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
    focus:ring-offset-2 dark:focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `,
  
  // Ghost button
  ghost: `
    bg-transparent 
    text-gray-600 dark:text-gray-400 
    hover:bg-gray-100 dark:hover:bg-gray-800 
    hover:text-gray-900 dark:hover:text-white
    focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
    focus:ring-offset-2 dark:focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `,
}

// Input styles
export const inputs = {
  // Default input
  default: `
    bg-white dark:bg-gray-800 
    border border-gray-300 dark:border-gray-600 
    text-gray-900 dark:text-white 
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 
    focus:border-purple-500 dark:focus:border-purple-400
    disabled:bg-gray-50 dark:disabled:bg-gray-900 
    disabled:text-gray-500 dark:disabled:text-gray-400
    transition-colors duration-200
  `,
  
  // Error state
  error: `
    bg-white dark:bg-gray-800 
    border border-red-500 dark:border-red-400 
    text-gray-900 dark:text-white 
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 
    focus:border-red-500 dark:focus:border-red-400
  `,
}

// Gradient backgrounds
export const gradients = {
  // Hero gradients
  heroPurple: 'bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900',
  heroBlue: 'bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900',
  heroDark: 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900',
  
  // Card gradients
  cardPurple: 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
  cardBlue: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
  
  // Text gradients
  textGradient: 'bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent',
}

// Responsive utilities
export const responsive = {
  // Container widths
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  containerNarrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  containerWide: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Grid layouts
  gridCols2: 'grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8',
  gridCols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8',
  gridCols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8',
  
  // Flex layouts
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  flexWrap: 'flex flex-wrap',
}

// Animation classes
export const animations = {
  fadeIn: 'animate-fade-in',
  fadeInUp: 'animate-fade-in-up',
  scaleIn: 'animate-scale-in',
  slideInRight: 'animate-slide-in-right',
  pulseSlow: 'animate-pulse-slow',
  
  // Transition utilities
  transition: 'transition-all duration-300 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
  transitionSlow: 'transition-all duration-500 ease-in-out',
}

// Helper function to combine classes conditionally
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Helper function to get section classes with optional variants
export const getSectionClasses = (variant: 'default' | 'alt' | 'dark' = 'default'): string => {
  const variantMap = {
    default: backgrounds.section,
    alt: backgrounds.sectionAlt,
    dark: backgrounds.sectionDark,
  }
  return cn(variantMap[variant], 'py-16 lg:py-20')
}

// Helper function to get card classes with optional hover
export const getCardClasses = (hoverable = true): string => {
  return cn(
    backgrounds.card,
    borders.default,
    'rounded-lg p-6',
    hoverable && backgrounds.cardHover,
    hoverable && animations.transition
  )
}

// Helper function to get button classes by variant
export const getButtonClasses = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
): string => {
  const sizeMap = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  return cn(
    buttons[variant],
    sizeMap[size],
    'rounded-lg font-medium inline-flex items-center justify-center'
  )
}

// Helper function to get heading classes by level
export const getHeadingClasses = (level: 1 | 2 | 3 | 4 | 5 | 6): string => {
  const levelMap = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
    2: 'text-3xl md:text-4xl font-bold',
    3: 'text-2xl md:text-3xl font-bold',
    4: 'text-xl md:text-2xl font-semibold',
    5: 'text-lg md:text-xl font-semibold',
    6: 'text-base md:text-lg font-semibold',
  }
  
  return cn(levelMap[level], textColors.primary)
}

// Export all utilities as a single object for convenience
export const styles = {
  backgrounds,
  textColors,
  borders,
  shadows,
  buttons,
  inputs,
  gradients,
  responsive,
  animations,
  cn,
  getSectionClasses,
  getCardClasses,
  getButtonClasses,
  getHeadingClasses,
}

export default styles