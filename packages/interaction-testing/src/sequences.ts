import type { DragRecognizer, InteractionSnapshot, PointerSample } from '@pfx/interaction-core';

/** @public */
export function runDragSequence(
  recognizer: DragRecognizer,
  samples: readonly PointerSample[],
): InteractionSnapshot[] {
  const output: InteractionSnapshot[] = [];
  for (const sample of samples) {
    const snapshot = recognizer.handle(sample);
    if (snapshot) output.push(snapshot);
  }
  return output;
}
