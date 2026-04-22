export type Priority = 'headliner' | 'main_act' | 'support'
export type Stage = 'main' | 'workshop'
export type Tag = 'core-react' | 'performance' | 'ux-design' | 'ecosystem'
export type Day = 'day1' | 'day2'

export interface Talk {
  id: string
  title: string
  speaker: string
  bio: string
  startTime: number
  duration: number
  priority: Priority
  stage: Stage
  tag: Tag
  day: Day
  description: string
  youtubeId?: string
}

export interface Connection {
  id: string
  name: string
  role: string
  company: string
  linkedInUrl: string
  scannedAt: number
}

export interface Point {
  x: number
  y: number
}