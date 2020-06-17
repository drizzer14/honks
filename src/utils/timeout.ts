export async function timeout(
  callback: () => void,
  delay: number
): Promise<NodeJS.Timeout> {
  return Promise.resolve(setTimeout(callback, delay));
}
