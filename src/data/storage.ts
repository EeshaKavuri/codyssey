export const storageKeys = {
  profileName: 'codyssey-profile-name',
  selectedWeek: 'codyssey-selected-week',
  completed: 'codyssey-completed',
  solvedProblems: 'codyssey-solved-problems',
  currentView: 'codyssey-current-view',
  visualWorkspace: 'codyssey-visual-workspace',
} as const

const legacyPrefix = ['algo', 'prep'].join('')

Object.entries(storageKeys).forEach(([name, key]) => {
  if (localStorage.getItem(key) !== null) return
  const suffixes: Record<string, string> = {
    profileName: 'profile-name',
    selectedWeek: 'selected-week',
    completed: 'completed',
    solvedProblems: 'solved-problems',
    currentView: 'current-view',
    visualWorkspace: 'visual-workspace',
  }
  const legacyKey = `${legacyPrefix}-${suffixes[name]}`
  const value = localStorage.getItem(legacyKey)
  if (value !== null) {
    localStorage.setItem(key, value)
    localStorage.removeItem(legacyKey)
  }
})
