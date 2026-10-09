import { clamp } from '@pfx/interaction-core';
import { useDrag, useKeyboardSensor } from '@pfx/interaction-react';
import { useRef } from 'react';

const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'];
function Reset({ label, reset }: { label: string; reset: () => void }) {
  return (
    <button
      type="button"
      className="control-button reset-button"
      aria-label={`Reset ${label}`}
      onClick={reset}
    >
      <span aria-hidden="true">↺</span> Reset
    </button>
  );
}

export function WindowDrag() {
  const stageRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const paint = (x: number, y: number) => {
    const stage = stageRef.current;
    const window = windowRef.current;
    const maxX = Math.max(0, ((stage?.clientWidth || 0) - (window?.offsetWidth || 0)) / 2 - 12);
    const maxY = Math.max(0, ((stage?.clientHeight || 0) - (window?.offsetHeight || 0)) / 2 - 12);
    const point = { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
    positionRef.current = point;
    if (window) window.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    if (outputRef.current)
      outputRef.current.value = `X ${Math.round(point.x)} / Y ${Math.round(point.y)} px`;
  };
  useDrag(titleRef, {
    preventDefault: true,
    onChange(snapshot) {
      if (titleRef.current) titleRef.current.dataset.active = String(snapshot.isActive);
      if (snapshot.phase === 'start' || snapshot.phase === 'update')
        paint(positionRef.current.x + snapshot.delta.x, positionRef.current.y + snapshot.delta.y);
    },
  });
  useKeyboardSensor(titleRef, {
    preventDefault: (event) => keys.includes(event.key),
    onSample(sample) {
      if (sample.phase !== 'down') return;
      const { x, y } = positionRef.current;
      const step = sample.modifiers.shift ? 2 : 12;
      if (sample.key === 'ArrowRight') paint(x + step, y);
      if (sample.key === 'ArrowLeft') paint(x - step, y);
      if (sample.key === 'ArrowUp') paint(x, y - step);
      if (sample.key === 'ArrowDown') paint(x, y + step);
      if (sample.key === 'Home') paint(0, 0);
    },
  });
  return (
    <section className="card card-window">
      <header>
        <div>
          <span className="card-index">09 / WINDOW MOVEMENT</span>
          <h2>Window Drag</h2>
        </div>
      </header>
      <div className="position-readout">
        <output ref={outputRef}>X 0 / Y 0 px</output>
      </div>
      <div ref={stageRef} className="applied-stage">
        <div ref={windowRef} className="demo-window">
          <div
            ref={titleRef}
            className="window-handle"
            role="application"
            aria-label="Window title bar. Drag or use arrow keys."
            // biome-ignore lint/a11y/noNoninteractiveTabindex: The title bar implements keyboard movement.
            tabIndex={0}
          >
            <span className="window-dots" aria-hidden="true">
              ● ● ●
            </span>
            <span>Workspace</span>
            <span aria-hidden="true">⠿</span>
          </div>
          <div className="window-content">
            <strong>A movable window</strong>
            <p>Only the title bar moves this window.</p>
            <label>
              Note
              <input aria-label="Window note" defaultValue="You can edit this text" />
            </label>
          </div>
        </div>
      </div>
      <div className="control-toolbar">
        <span className="control-hint">Drag the title bar · Arrow keys</span>
        <Reset label="Window Drag" reset={() => paint(0, 0)} />
      </div>
      <p>Move a window while its content remains usable.</p>
    </section>
  );
}

export function ResizeCard() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const sizeRef = useRef({ width: 220, height: 130 });
  const topLeftRef = useRef<HTMLDivElement>(null);
  const topRightRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);
  const paint = (width: number, height: number) => {
    const maxWidth = Math.max(150, (stageRef.current?.clientWidth || 246) - 24);
    const maxHeight = Math.max(100, (stageRef.current?.clientHeight || 224) - 24);
    const size = { width: clamp(width, 150, maxWidth), height: clamp(height, 100, maxHeight) };
    sizeRef.current = size;
    if (cardRef.current) {
      cardRef.current.style.width = `${size.width}px`;
      cardRef.current.style.height = `${size.height}px`;
    }
    if (outputRef.current)
      outputRef.current.value = `W ${Math.round(size.width)} / H ${Math.round(size.height)} px`;
    for (const ref of [topLeftRef, topRightRef, bottomLeftRef, bottomRightRef])
      ref.current?.setAttribute(
        'aria-valuetext',
        `${Math.round(size.width)} by ${Math.round(size.height)} pixels`,
      );
  };
  function useCorner(ref: typeof topLeftRef, xSign: number, ySign: number) {
    useDrag(ref, {
      preventDefault: true,
      onChange(snapshot) {
        if (ref.current) ref.current.dataset.active = String(snapshot.isActive);
        if (snapshot.phase === 'start' || snapshot.phase === 'update')
          paint(
            sizeRef.current.width + snapshot.delta.x * 2 * xSign,
            sizeRef.current.height + snapshot.delta.y * 2 * ySign,
          );
      },
    });
    useKeyboardSensor(ref, {
      preventDefault: (event) => keys.includes(event.key),
      onSample(sample) {
        if (sample.phase !== 'down') return;
        const { width, height } = sizeRef.current;
        const step = sample.modifiers.shift ? 2 : 12;
        if (sample.key === 'ArrowRight') paint(width + step * xSign, height);
        if (sample.key === 'ArrowLeft') paint(width - step * xSign, height);
        if (sample.key === 'ArrowDown') paint(width, height + step * ySign);
        if (sample.key === 'ArrowUp') paint(width, height - step * ySign);
        if (sample.key === 'Home') paint(220, 130);
      },
    });
  }
  useCorner(topLeftRef, -1, -1);
  useCorner(topRightRef, 1, -1);
  useCorner(bottomLeftRef, -1, 1);
  useCorner(bottomRightRef, 1, 1);
  return (
    <section className="card card-resize">
      <header>
        <div>
          <span className="card-index">10 / SIZE CONTROL</span>
          <h2>Resize Card</h2>
        </div>
      </header>
      <div className="position-readout">
        <output ref={outputRef}>W 220 / H 130 px</output>
      </div>
      <div ref={stageRef} className="applied-stage resize-stage">
        <div ref={cardRef} className="resizable-card">
          <span className="resize-card-kicker">RESIZABLE</span>
          <strong>Change the dimensions.</strong>
          <span className="resize-card-line" aria-hidden="true" />
          {[
            { ref: topLeftRef, name: 'top left', corner: 'tl' },
            { ref: topRightRef, name: 'top right', corner: 'tr' },
            { ref: bottomLeftRef, name: 'bottom left', corner: 'bl' },
            { ref: bottomRightRef, name: 'bottom right', corner: 'br' },
          ].map(({ ref, name, corner }) => (
            <div
              key={corner}
              ref={ref}
              className={`resize-handle resize-handle--${corner}`}
              role="application"
              aria-label={`Resize from ${name}. Drag or use arrow keys.`}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: Corner handles implement two-axis keyboard resizing.
              tabIndex={0}
            />
          ))}
        </div>
      </div>
      <div className="control-toolbar">
        <span className="control-hint">Drag any corner · Shift for fine steps</span>
        <Reset label="Resize Card" reset={() => paint(220, 130)} />
      </div>
      <p>Resize from four corners with minimum and maximum dimensions.</p>
    </section>
  );
}

export function ImagePan() {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const paint = (x: number, y: number) => {
    const maxX = Math.max(
      0,
      ((imageRef.current?.offsetWidth || 0) - (frameRef.current?.clientWidth || 0)) / 2,
    );
    const maxY = Math.max(
      0,
      ((imageRef.current?.offsetHeight || 0) - (frameRef.current?.clientHeight || 0)) / 2,
    );
    const point = { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
    positionRef.current = point;
    if (imageRef.current)
      imageRef.current.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    if (outputRef.current)
      outputRef.current.value = `X ${Math.round(point.x)} / Y ${Math.round(point.y)} px`;
  };
  useDrag(frameRef, {
    preventDefault: true,
    onChange(snapshot) {
      if (frameRef.current) frameRef.current.dataset.active = String(snapshot.isActive);
      if (snapshot.phase === 'start' || snapshot.phase === 'update')
        paint(positionRef.current.x + snapshot.delta.x, positionRef.current.y + snapshot.delta.y);
    },
  });
  useKeyboardSensor(frameRef, {
    preventDefault: (event) => keys.includes(event.key),
    onSample(sample) {
      if (sample.phase !== 'down') return;
      const { x, y } = positionRef.current;
      const step = sample.modifiers.shift ? 2 : 12;
      if (sample.key === 'ArrowRight') paint(x + step, y);
      if (sample.key === 'ArrowLeft') paint(x - step, y);
      if (sample.key === 'ArrowUp') paint(x, y - step);
      if (sample.key === 'ArrowDown') paint(x, y + step);
      if (sample.key === 'Home') paint(0, 0);
    },
  });
  return (
    <section className="card card-image">
      <header>
        <div>
          <span className="card-index">11 / IMAGE FRAMING</span>
          <h2>Image Pan</h2>
        </div>
      </header>
      <div className="position-readout">
        <output ref={outputRef}>X 0 / Y 0 px</output>
      </div>
      <div
        ref={frameRef}
        className="image-frame"
        role="application"
        aria-label="Image crop. Drag or use arrow keys to reframe."
        // biome-ignore lint/a11y/noNoninteractiveTabindex: The crop surface implements keyboard panning.
        tabIndex={0}
      >
        <div ref={imageRef} className="pan-image">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="PFxamd logo on a patterned canvas"
            draggable={false}
          />
        </div>
        <div className="crop-guides" aria-hidden="true" />
        <span className="crop-caption" aria-hidden="true">
          FIXED FRAME / MOVABLE IMAGE
        </span>
      </div>
      <div className="control-toolbar">
        <span className="control-hint">Drag to reframe · Home to center</span>
        <Reset label="Image Pan" reset={() => paint(0, 0)} />
      </div>
      <p>Move a larger image inside a fixed crop without exposing empty edges.</p>
    </section>
  );
}
