export function generateShortcuts(
  targetCount: number,
  baseCharacters: string
): string[] {
  const shortcuts = new Set<string>()
  let currentLength = 1

  while (shortcuts.size < targetCount) {
    const combinations = getAllCombinations(baseCharacters, currentLength)
    for (const combo of combinations) {
      for (let length = 1; length < combo.length; length++) {
        const prefix = combo.substring(0, length)
        if (shortcuts.has(prefix)) {
          shortcuts.delete(prefix)
        }
      }
      shortcuts.add(combo)
      if (shortcuts.size === targetCount) break
    }
    currentLength++
  }
  return Array.from(shortcuts)
}

const combinationMemo: { [key: string]: string[] } = {}

function getAllCombinations(chars: string, length: number): string[] {
  const memoKey = `${chars}-${length}`
  if (combinationMemo[memoKey]) {
    return combinationMemo[memoKey]
  }

  if (length === 1) {
    combinationMemo[memoKey] = chars.split('')
    return chars.split('')
  }

  const combinations: string[] = []
  const shorterCombinations = getAllCombinations(chars, length - 1)

  for (const char of chars) {
    for (const short of shorterCombinations) {
      combinations.push(char + short)
    }
  }

  combinationMemo[memoKey] = combinations
  return combinations
}
