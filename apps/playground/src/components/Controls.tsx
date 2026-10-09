import {
  animateSpring,
  applyPrecision,
  clamp,
  type InteractionSnapshot,
  stepValue,
  wrap,
} from '@pfx/interaction-core';
import { createRafScheduler } from '@pfx/interaction-dom';
import { useDrag, useKeyboardSensor } from '@pfx/interaction-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

const arrows = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
function active(element: HTMLElement | null, snapshot: InteractionSnapshot) {
  if (element) element.dataset.active = String(snapshot.isActive);
}
function Reset({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      className="control-button reset-button"
      type="button"
      onClick={onClick}
      aria-label={`Reset ${label}`}
    >
      <span aria-hidden="true">↺</span> Reset
    </button>
  );
}
function Mode({
  children,
  pressed,
  onClick,
}: {
  children: ReactNode;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="control-button mode-button"
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function Scale() {
  return (
    <div className="control-scale" aria-hidden="true">
      {[0, 25, 50, 75, 100].map((value) => (
        <span key={value}>{value}</span>
      ))}
    </div>
  );
}

export function ScalarControl({
  vertical = false,
  snap = false,
}: {
  vertical?: boolean;
  snap?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const valueRef = useRef(0.5);
  const startRef = useRef(0.5);
  const [fine, setFine] = useState(false);
  const label = snap ? 'Snap Points' : vertical ? 'Vertical Axis' : 'Axis + Precision';
  const paint = (value: number) => {
    const next = snap ? stepValue(clamp(value, 0, 1), 0.25) : clamp(value, 0, 1);
    valueRef.current = next;
    if (thumbRef.current)
      thumbRef.current.style[vertical ? 'top' : 'left'] = `${(vertical ? 1 - next : next) * 100}%`;
    if (outputRef.current) outputRef.current.value = next.toFixed(3);
    trackRef.current?.setAttribute('aria-valuenow', String(Math.round(next * 100)));
    trackRef.current?.style.setProperty('--value', `${next * 100}%`);
  };
  useDrag(trackRef, {
    preventDefault: true,
    onChange(snapshot) {
      active(trackRef.current, snapshot);
      if (snapshot.phase === 'start') startRef.current = valueRef.current;
      if (snapshot.phase !== 'start' && snapshot.phase !== 'update') return;
      const size = (vertical ? trackRef.current?.clientHeight : trackRef.current?.clientWidth) || 1;
      if (snap) paint(startRef.current + snapshot.offset.x / size);
      else
        paint(
          valueRef.current +
            applyPrecision(
              (vertical ? -snapshot.delta.y : snapshot.delta.x) / size,
              fine || snapshot.modifiers.shift,
              0.12,
            ),
        );
    },
  });
  useKeyboardSensor(trackRef, {
    preventDefault: (event) =>
      arrows.includes(event.key) || event.key === 'Home' || event.key === 'End',
    onSample(sample) {
      if (sample.phase !== 'down') return;
      const amount = snap ? 0.25 : fine || sample.modifiers.shift ? 0.005 : 0.025;
      if (sample.key === 'Home') paint(0);
      if (sample.key === 'End') paint(1);
      if (sample.key === 'ArrowRight' || sample.key === 'ArrowUp') paint(valueRef.current + amount);
      if (sample.key === 'ArrowLeft' || sample.key === 'ArrowDown')
        paint(valueRef.current - amount);
    },
  });
  return (
    <section className={`card ${vertical ? 'card-vertical' : snap ? 'card-snap' : 'card-axis'}`}>
      <header>
        <div>
          <span className="card-index">
            {snap ? '07 / CONSTRAINTS' : vertical ? '02 / AXIS CONTROL' : '01 / SCALAR INPUT'}
          </span>
          <h2>{label}</h2>
        </div>
        <output ref={outputRef} aria-label={`${label} value`}>
          0.500
        </output>
      </header>
      <div className="scalar-stage">
        <div
          ref={trackRef}
          className={vertical ? 'vertical-slider' : `slider ${snap ? 'snap-slider' : ''}`}
          tabIndex={0}
          role="slider"
          aria-label={vertical ? 'Vertical value' : snap ? 'Snap value' : 'Interaction value'}
          aria-orientation={vertical ? 'vertical' : 'horizontal'}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={50}
          data-testid={vertical ? 'vertical-slider' : snap ? 'snap-slider' : 'slider'}
        >
          {snap &&
            [0, 25, 50, 75, 100].map((value) => <i key={value} style={{ left: `${value}%` }} />)}
          <div
            ref={thumbRef}
            className={vertical ? 'vertical-thumb' : 'thumb'}
            style={vertical ? { top: '50%' } : { left: '50%' }}
          />
        </div>
        {vertical ? (
          <div className="vertical-scale" aria-hidden="true">
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
        ) : (
          <Scale />
        )}
      </div>
      <div className="control-toolbar">
        {!snap && (
          <Mode pressed={fine} onClick={() => setFine(!fine)}>
            Precision
          </Mode>
        )}
        <span className="control-hint">{snap ? '5 fixed positions' : 'Shift · fine movement'}</span>
        <Reset label={label} onClick={() => paint(0.5)} />
      </div>
      <p>
        {snap
          ? 'Drag between stops or use the arrow keys.'
          : 'Drag the handle or use arrow keys. Home / End jump to limits.'}
      </p>
    </section>
  );
}

export function XYControl({ hero = false }: { hero?: boolean }) {
  const padRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const valueRef = useRef({ x: 0.5, y: 0.5 });
  const paint = (x: number, y: number) => {
    const point = { x: clamp(x, 0, 1), y: clamp(y, 0, 1) };
    valueRef.current = point;
    if (handleRef.current) {
      handleRef.current.style.left = `${point.x * 100}%`;
      handleRef.current.style.top = `${point.y * 100}%`;
    }
    if (outputRef.current)
      outputRef.current.value = `X ${point.x.toFixed(3)} / Y ${point.y.toFixed(3)}`;
  };
  useDrag(padRef, {
    preventDefault: true,
    onChange(snapshot) {
      active(padRef.current, snapshot);
      if (snapshot.phase !== 'start' && snapshot.phase !== 'update') return;
      paint(
        valueRef.current.x + snapshot.delta.x / (padRef.current?.clientWidth || 1),
        valueRef.current.y + snapshot.delta.y / (padRef.current?.clientHeight || 1),
      );
    },
  });
  useKeyboardSensor(padRef, {
    preventDefault: (event) => arrows.includes(event.key) || event.key === 'Home',
    onSample(sample) {
      if (sample.phase !== 'down') return;
      const step = sample.modifiers.shift ? 0.005 : 0.025;
      const { x, y } = valueRef.current;
      if (sample.key === 'ArrowLeft') paint(x - step, y);
      if (sample.key === 'ArrowRight') paint(x + step, y);
      if (sample.key === 'ArrowUp') paint(x, y - step);
      if (sample.key === 'ArrowDown') paint(x, y + step);
      if (sample.key === 'Home') paint(0.5, 0.5);
    },
  });
  const pad = (
    <div
      ref={padRef}
      className={`xy-pad ${hero ? 'hero-pad' : ''}`}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: This custom two-axis control implements arrow-key interaction.
      tabIndex={0}
      role="application"
      aria-label={
        hero
          ? 'Interactive signal space. Drag or use arrow keys.'
          : 'XY position. Drag or use arrow keys.'
      }
      data-testid={hero ? 'hero-pad' : 'xy-pad'}
    >
      <span className="pad-label" aria-hidden="true">
        {hero ? 'SIGNAL SPACE' : 'Y / X'}
      </span>
      {hero && (
        <b className="pad-wordmark" aria-hidden="true">
          PFx
        </b>
      )}
      <div ref={handleRef} className="xy-handle" style={{ left: '50%', top: '50%' }} />
      <span className="pad-instruction" aria-hidden="true">
        DRAG TO EXPLORE
      </span>
    </div>
  );
  if (hero)
    return (
      <div className="hero-instrument">
        <div className="instrument-heading">
          <span>LIVE INPUT</span>
          <span className="live-dot" />
        </div>
        {pad}
        <div className="instrument-footer">
          <output ref={outputRef}>X 0.500 / Y 0.500</output>
          <Reset label="signal space" onClick={() => paint(0.5, 0.5)} />
        </div>
      </div>
    );
  return (
    <section className="card card-xy">
      <header>
        <div>
          <span className="card-index">03 / VECTOR CONTROL</span>
          <h2>XY Control</h2>
        </div>
      </header>
      <div className="position-readout">
        <output ref={outputRef}>X 0.500 / Y 0.500</output>
      </div>
      {pad}
      <div className="control-toolbar">
        <span className="control-hint">Arrow keys · Shift for precision</span>
        <Reset label="XY Control" onClick={() => paint(0.5, 0.5)} />
      </div>
      <p>Move in two axes. Values stay within the pad boundaries.</p>
    </section>
  );
}

export function RotaryControl() {
  const controlRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const valueRef = useRef(0);
  const rawRef = useRef(0);
  const [fine, setFine] = useState(false);
  const [detents, setDetents] = useState(false);
  const paint = (degrees: number, stepped = detents) => {
    rawRef.current = degrees;
    valueRef.current = wrap(stepped ? stepValue(degrees, 15) : degrees, 0, 360);
    if (dialRef.current) dialRef.current.style.transform = `rotate(${valueRef.current}deg)`;
    if (outputRef.current) outputRef.current.value = `${Math.round(valueRef.current)}°`;
    controlRef.current?.setAttribute(
      'aria-valuenow',
      String(Math.min(359, Math.round(valueRef.current))),
    );
  };
  useDrag(controlRef, {
    preventDefault: true,
    onChange(snapshot) {
      active(controlRef.current, snapshot);
      if (snapshot.phase === 'start') rawRef.current = valueRef.current;
      if (snapshot.phase !== 'start' && snapshot.phase !== 'update') return;
      paint(
        rawRef.current - snapshot.delta.y * (fine || snapshot.modifiers.shift ? 0.2 : 1.2),
        detents || snapshot.modifiers.alt,
      );
    },
  });
  useKeyboardSensor(controlRef, {
    preventDefault: (event) =>
      arrows.includes(event.key) || event.key === 'Home' || event.key === 'End',
    onSample(sample) {
      if (sample.phase !== 'down') return;
      const stepped = detents || sample.modifiers.alt;
      const step = stepped ? 15 : fine || sample.modifiers.shift ? 1 : 5;
      if (sample.key === 'Home') paint(0, false);
      if (sample.key === 'End') paint(359, false);
      if (sample.key === 'ArrowUp' || sample.key === 'ArrowRight')
        paint(valueRef.current + step, stepped);
      if (sample.key === 'ArrowDown' || sample.key === 'ArrowLeft')
        paint(valueRef.current - step, stepped);
    },
  });
  return (
    <section className="card card-rotary">
      <header>
        <div>
          <span className="card-index">04 / ANGULAR INPUT</span>
          <h2>Rotary + Detents</h2>
        </div>
        <output ref={outputRef}>0°</output>
      </header>
      <div className="dial-stage">
        <div className="dial-ticks" aria-hidden="true" />
        <div
          ref={controlRef}
          className="rotary-wrap"
          role="slider"
          tabIndex={0}
          aria-label="Rotation angle"
          aria-valuemin={0}
          aria-valuemax={359}
          aria-valuenow={0}
        >
          <div ref={dialRef} className="rotary">
            <i />
          </div>
          <span className="dial-caption" aria-hidden="true">
            ROTATE
          </span>
        </div>
      </div>
      <div className="control-toolbar">
        <Mode pressed={fine} onClick={() => setFine(!fine)}>
          Precision
        </Mode>
        <Mode
          pressed={detents}
          onClick={() => {
            setDetents(!detents);
            paint(valueRef.current, !detents);
          }}
        >
          15° stops
        </Mode>
        <Reset label="Rotary" onClick={() => paint(0)} />
      </div>
      <p>Drag vertically or use arrow keys. Alt enables 15° stops.</p>
    </section>
  );
}

export function DragControl({ spring = false }: { spring?: boolean }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<Array<ReturnType<typeof animateSpring>>>([]);
  const schedulerRef = useRef(createRafScheduler());
  const label = spring ? 'Spring Return' : 'Free Drag';
  const cancel = () => {
    for (const animation of animationRef.current) animation.cancel();
  };
  useEffect(
    () => () => {
      for (const animation of animationRef.current) animation.cancel();
    },
    [],
  );
  const paint = (x: number, y: number) => {
    const zone = zoneRef.current;
    const object = objectRef.current;
    const limitX = Math.max(0, ((zone?.clientWidth || 0) - (object?.offsetWidth || 0)) / 2 - 12);
    const limitY = Math.max(0, ((zone?.clientHeight || 0) - (object?.offsetHeight || 0)) / 2 - 12);
    const point = { x: clamp(x, -limitX, limitX), y: clamp(y, -limitY, limitY) };
    positionRef.current = point;
    if (object) object.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    if (outputRef.current)
      outputRef.current.value = `X ${Math.round(point.x)} / Y ${Math.round(point.y)} px`;
  };
  const returnHome = () => {
    cancel();
    if (!spring || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paint(0, 0);
      return;
    }
    animationRef.current = (['x', 'y'] as const).map((axis) =>
      animateSpring({
        scheduler: schedulerRef.current,
        from: { position: positionRef.current[axis], velocity: 0 },
        target: 0,
        spring: { stiffness: 260, damping: 24 },
        onUpdate(state) {
          const point = { ...positionRef.current, [axis]: state.position };
          paint(point.x, point.y);
        },
      }),
    );
  };
  useDrag(objectRef, {
    preventDefault: true,
    onChange(snapshot) {
      active(objectRef.current, snapshot);
      if (snapshot.phase === 'start') cancel();
      if (snapshot.phase === 'start' || snapshot.phase === 'update')
        paint(positionRef.current.x + snapshot.delta.x, positionRef.current.y + snapshot.delta.y);
      if (spring && (snapshot.phase === 'end' || snapshot.phase === 'cancel')) returnHome();
    },
  });
  useKeyboardSensor(objectRef, {
    preventDefault: (event) =>
      arrows.includes(event.key) || event.key === 'Home' || event.key === 'Escape',
    onSample(sample) {
      if (sample.phase === 'up') {
        if (spring && arrows.includes(sample.key)) returnHome();
        return;
      }
      cancel();
      const { x, y } = positionRef.current;
      const step = sample.modifiers.shift ? 2 : 12;
      if (sample.key === 'ArrowLeft') paint(x - step, y);
      if (sample.key === 'ArrowRight') paint(x + step, y);
      if (sample.key === 'ArrowUp') paint(x, y - step);
      if (sample.key === 'ArrowDown') paint(x, y + step);
      if (sample.key === 'Home' || sample.key === 'Escape') returnHome();
    },
  });
  return (
    <section className={`card ${spring ? 'card-spring' : 'card-free'}`}>
      <header>
        <div>
          <span className="card-index">
            {spring ? '06 / MOTION PHYSICS' : '05 / SPATIAL INPUT'}
          </span>
          <h2>{label}</h2>
        </div>
      </header>
      <div className="position-readout">
        <output ref={outputRef}>X 0 / Y 0 px</output>
      </div>
      <div ref={zoneRef} className={spring ? 'spring-zone' : 'free-zone'}>
        <span className="origin-mark" aria-hidden="true" />
        <div
          ref={objectRef}
          className={spring ? 'spring-object' : 'free-object'}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: This draggable control implements arrow-key movement and reset.
          tabIndex={0}
          role="application"
          aria-label={`${label}. Drag or use arrow keys.`}
        >
          {spring ? 'PFx' : 'MOVE'}
          <span aria-hidden="true">↔</span>
        </div>
      </div>
      <div className="control-toolbar">
        <span className="control-hint">
          {spring ? 'Release to return' : 'Home · return to center'}
        </span>
        <Reset
          label={label}
          onClick={() => {
            cancel();
            paint(0, 0);
          }}
        />
      </div>
      <p>
        {spring
          ? 'Pull away from the origin, then release to feel the spring.'
          : 'Grab the object and move it within the stage.'}
      </p>
    </section>
  );
}

export function InputProbe() {
  const probeRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  useDrag(probeRef, {
    preventDefault: true,
    onChange(snapshot) {
      active(probeRef.current, snapshot);
      if (outputRef.current)
        outputRef.current.value = `${snapshot.pointerType} · ${snapshot.phase} · pressure ${snapshot.pressure.toFixed(2)}`;
    },
  });
  useKeyboardSensor(probeRef, {
    preventDefault: (event) => arrows.includes(event.key) || event.key === ' ',
    onSample(sample) {
      if (outputRef.current)
        outputRef.current.value = `keyboard · ${sample.key === ' ' ? 'Space' : sample.key} · ${sample.phase}`;
    },
  });
  return (
    <section className="card card-probe">
      <header>
        <div>
          <span className="card-index">08 / DEVICE SIGNAL</span>
          <h2>Input Probe</h2>
        </div>
      </header>
      <div className="position-readout">
        <output ref={outputRef}>Ready for input</output>
      </div>
      <div
        ref={probeRef}
        className="probe-zone"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: The probe is a keyboard input capture surface.
        tabIndex={0}
        role="application"
        aria-label="Input probe. Press, drag, or use keyboard."
      >
        <span className="probe-target" aria-hidden="true">
          +
        </span>
        <span>Press, drag, or type</span>
      </div>
      <div className="control-toolbar">
        <span className="control-hint">Mouse / Touch / Pen / Keyboard</span>
        <Reset
          label="Input Probe"
          onClick={() => {
            if (outputRef.current) outputRef.current.value = 'Ready for input';
          }}
        />
      </div>
      <p>See the input device, interaction phase, and pointer pressure.</p>
    </section>
  );
}
