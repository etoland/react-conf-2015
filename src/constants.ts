import type { Tag } from './types'

export const TAG_COLORS: Record<Tag, string> = {
  'core-react':  '#3B82F6',
  'performance': '#A855F7',
  'ux-design':   '#F97316',
  'ecosystem':   '#94A3B8',
}

export const TAG_LABELS: Record<Tag, string> = {
  'core-react':  'Core React',
  'performance': 'Performance',
  'ux-design':   'UX & Design',
  'ecosystem':   'Ecosystem',
}

export const STAGE_COLORS: Record<string, string> = {
  main:     '#E07B54',
  workshop: '#7BAE84',
}

export const STAGE_LABELS: Record<string, string> = {
  main:     'Main Stage',
  workshop: 'Workshop',
}