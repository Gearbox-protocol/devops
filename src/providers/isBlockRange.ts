export default function isBlockRange(e: any): boolean {
  return e instanceof Error && e.message.includes("block range");
}
