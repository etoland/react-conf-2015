import type { Talk, Point, Stage, Priority } from '../types'

export const DAY_START = 9 * 60
export const DAY_END = 18 * 60
export const PIXELS_PER_MINUTE = 12

export const STAGE_Y: Record<Stage, number> = {
  main:     80,
  workshop: 340,
}

export const STAGE_HEIGHT: Record<Priority, number> = {
  headliner: 180,
  main_act:  120,
  support:    70,
}

export function calculatePosition(talk: Talk) {
  return {
    left:   (talk.startTime - DAY_START) * PIXELS_PER_MINUTE,
    width:   talk.duration * PIXELS_PER_MINUTE,
    top:     STAGE_Y[talk.stage],
    height:  STAGE_HEIGHT[talk.priority],
  }
}

export function scrubberToX(timeInMinutes: number): number {
  return (timeInMinutes - DAY_START) * PIXELS_PER_MINUTE
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  pan: Point,
  zoom: number
): Point {
  return {
    x: (screenX - pan.x) / zoom,
    y: (screenY - pan.y) / zoom,
  }
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  pan: Point,
  zoom: number
): Point {
  return {
    x: worldX * zoom + pan.x,
    y: worldY * zoom + pan.y,
  }
}

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h > 12 ? h - 12 : h
  return m === 0
    ? `${hour}${suffix}`
    : `${hour}:${String(m).padStart(2, '0')}${suffix}`
}