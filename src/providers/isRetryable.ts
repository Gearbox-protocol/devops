import { utils } from "ethers";

export default function isRetryable(e: any): boolean {
  return (
    !!e &&
    (e.code === utils.Logger.errors.UNKNOWN_ERROR ||
      e.code === utils.Logger.errors.SERVER_ERROR ||
      e.code === utils.Logger.errors.NETWORK_ERROR ||
      e.code === utils.Logger.errors.TIMEOUT ||
      e.code === utils.Logger.errors.CALL_EXCEPTION ||
      e.code === utils.Logger.errors.UNPREDICTABLE_GAS_LIMIT)
  );
}
