export const getNewMotionName = (motionNames: string[]): string => {
  let motionName = 'Unnamed Motion 1'
  let motionNameIndex = 1
  while (motionNames.includes(motionName)) {
    motionName = `Unnamed Motion ${motionNameIndex}`
    motionNameIndex += 1
  }
  return motionName
}
