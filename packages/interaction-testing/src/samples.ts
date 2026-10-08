import type {
  KeyboardSample,
  ModifierKeys,
  PointerKind,
  PointerSample,
  WheelDeltaMode,
  WheelSample,
} from '@pfx/interaction-core';

const NONE: ModifierKeys = { shift: false, alt: false, ctrl: false, meta: false };

/** @public */
export function pointerSample(options: {
  phase: PointerSample['phase'];
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  timestamp?: number;
  pointerId?: number;
  pointerType?: PointerKind;
  pressure?: number;
  buttons?: number;
  modifiers?: ModifierKeys;
}): PointerSample {
  return {
    kind: 'pointer',
    phase: options.phase,
    timestamp: options.timestamp ?? 0,
    pointerId: options.pointerId ?? 1,
    pointerType: options.pointerType ?? 'mouse',
    position: { x: options.x ?? 0, y: options.y ?? 0 },
    delta: { x: options.dx ?? 0, y: options.dy ?? 0 },
    pressure: options.pressure ?? (options.phase === 'up' ? 0 : 0.5),
    buttons: options.buttons ?? (options.phase === 'up' ? 0 : 1),
    modifiers: options.modifiers ?? NONE,
  };
}

/** @public */
export function keyboardSample(options: {
  phase: KeyboardSample['phase'];
  key: string;
  code?: string;
  timestamp?: number;
  repeat?: boolean;
  modifiers?: ModifierKeys;
}): KeyboardSample {
  return {
    kind: 'keyboard',
    phase: options.phase,
    timestamp: options.timestamp ?? 0,
    key: options.key,
    code: options.code ?? options.key,
    repeat: options.repeat ?? false,
    modifiers: options.modifiers ?? NONE,
  };
}

/** @public */
export function wheelSample(
  options: {
    x?: number;
    y?: number;
    dx?: number;
    dy?: number;
    deltaMode?: WheelDeltaMode;
    timestamp?: number;
    modifiers?: ModifierKeys;
  } = {},
): WheelSample {
  return {
    kind: 'wheel',
    timestamp: options.timestamp ?? 0,
    delta: { x: options.dx ?? 0, y: options.dy ?? 0 },
    deltaMode: options.deltaMode ?? 'pixel',
    position: { x: options.x ?? 0, y: options.y ?? 0 },
    modifiers: options.modifiers ?? NONE,
  };
}
