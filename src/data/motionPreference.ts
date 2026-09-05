export type MotionPreference = 'system' | 'on' | 'off'

export function motionEnabledFor(preference: MotionPreference, systemReduced: boolean): boolean {
  return preference === 'system' ? !systemReduced : preference === 'on'
}
