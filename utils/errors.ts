import { IngesterErrorReason } from "@gcorevideo/rtckit"

export function getIngesterErrorReasonExplanation(code: IngesterErrorReason): string {
  switch (code) {
    case IngesterErrorReason.StreamNotExists:
      return 'Stream does not exist'
    case IngesterErrorReason.StreamTokenInvalid:
      return 'Stream token is invalid'
    case IngesterErrorReason.DuplicateStream:
      return 'Someone else is already streaming'
  }
}
