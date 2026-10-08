import { useEffect, useRef, useState } from 'react';
import {
  animateSpring,
  applyPrecision,
  clamp,
  stepValue,
  wrap,
} from '@pfx/interaction-core';
import { createRafScheduler } from '@pfx/interaction-dom';
import { useDrag, useKeyboardSensor } from '@pfx/interaction-react';

function HorizontalSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const valueRef = useRef(0.5);

  const paint = (value: number) => {
    valueRef.current = clamp(value, 0, 1);
    if (thumbRef.current) thumbRef.current.style.left = `${valueRef.current * 100}%`;
    if (outputRef.current) outputRef.current.value = valueRef.current.toFixed(3);
    trackRef.current?.setAttribute('aria-valuenow', String(Math.round(valueRef.current * 100)));
  };

  useDrag(trackRef, {
    preventDefault: true,
    onChange(snapshot) {
      if (snapshot.phase !== 'start' && snapshot.phase !== 'update') return;
      const width = trackRef.current?.clientWidth ?? 1;
      const delta = applyPrecision(snapshot.delta.x / width, snapshot.modifiers.shift, 0.12);
      paint(valueRef.current + delta);
    },
  });

  useKeyboardSensor(trackRef, {
    preventDefault: (event) => event.key === 'ArrowLeft' || event.key === 'ArrowRight',
    onSample(sample) {
      if (sample.phase !== 'down') return;
      const amount = sample.modifiers.shift ? 0.005 : 0.025;
      if (sample.key === 'ArrowLeft') paint(valueRef.current - amount);
      if (sample.key === 'ArrowRight') paint(valueRef.current + amount);
    },
  });

  return (
    <section className="card card-axis">
      <header><div className="card-heading"><span className="card-index">01 / SCALAR INPUT</span><h2>Axis + Precision</h2></div><output ref={outputRef}>0.500</output></header>
      <div
        ref={trackRef}
        className="slider"
        tabIndex={0}
        role="slider"
        aria-label="Interaction value"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
        data-testid="slider"
      >
        <div ref={thumbRef} className="thumb" style={{ left: '50%' }} />
      </div>
      <p>Drag or use arrow keys. Hold Shift for fine movement.</p>
    </section>
  );
}


function VerticalSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(0.5);

  const paint = (value: number) => {
    valueRef.current = clamp(value, 0, 1);
    if (thumbRef.current) thumbRef.current.style.top = `${(1 - valueRef.current) * 100}%`;
    trackRef.current?.setAttribute('aria-valuenow', String(Math.round(valueRef.current * 100)));
  };

  useDrag(trackRef, {
    preventDefault: true,
    onChange(snapshot) {
      if (snapshot.phase !== 'start' && snapshot.phase !== 'update') return;
      const height = trackRef.current?.clientHeight ?? 1;
      const delta = applyPrecision(-snapshot.delta.y / height, snapshot.modifiers.shift, 0.12);
      paint(valueRef.current + delta);
    },
  });

  useKeyboardSensor(trackRef, {
    preventDefault: (event) => event.key === 'ArrowUp' || event.key === 'ArrowDown',
    onSample(sample) {
      if (sample.phase !== 'down') return;
      const amount = sample.modifiers.shift ? 0.005 : 0.025;
      if (sample.key === 'ArrowUp') paint(valueRef.current + amount);
      if (sample.key === 'ArrowDown') paint(valueRef.current - amount);
    },
  });

  return (
    <section className="card card-vertical">
      <header><div className="card-heading"><span className="card-index">02 / AXIS CONTROL</span><h2>Vertical Axis</h2></div><span>1D</span></header>
      <div
        ref={trackRef}
        className="vertical-slider"
        tabIndex={0}
        role="slider"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
      >
        <div ref={thumbRef} className="vertical-thumb" style={{ top: '50%' }} />
      </div>
      <p>Vertical normalized control with keyboard and precision input.</p>
    </section>
  );
}

function FreeDrag() {
  const zoneRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  const paint = (x: number, y: number) => {
    positionRef.current = { x, y };
    if (objectRef.current) objectRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  useDrag(zoneRef, {
    preventDefault: true,
    onChange(snapshot) {
      if (snapshot.phase !== 'start' && snapshot.phase !== 'update') return;
      paint(positionRef.current.x + snapshot.delta.x, positionRef.current.y + snapshot.delta.y);
    },
  });

  return (
    <section className="card card-free">
      <header><div className="card-heading"><span className="card-index">03 / SPATIAL INPUT</span><h2>Free Drag</h2></div><span>2D Delta</span></header>
      <div ref={zoneRef} className="free-zone">
        <div ref={objectRef} className="free-object">MOVE</div>
      </div>
      <p>Raw relative 2D movement without domain meaning or visual assumptions.</p>
    </section>
  );
}

function InputProbe() {
  const probeRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);

  useDrag(probeRef, {
    preventDefault: true,
    onChange(snapshot) {
      if (!outputRef.current) return;
      outputRef.current.value = `${snapshot.pointerType} / pressure ${snapshot.pressure.toFixed(2)}`;
    },
  });

  return (
    <section className="card card-probe">
      <header><div className="card-heading"><span className="card-index">04 / DEVICE SIGNAL</span><h2>Input Probe</h2></div><output ref={outputRef}>idle</output></header>
      <div ref={probeRef} className="probe-zone">Touch / Pen / Mouse</div>
      <p>Verifies unified pointer input while preserving device characteristics.</p>
    </section>
  );
}

function XYPad() {
  const padRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef({ x: 0.5, y: 0.5 });

  const paint = (x: number, y: number) => {
    valueRef.current = { x: clamp(x, 0, 1), y: clamp(y, 0, 1) };
    if (handleRef.current) {
      handleRef.current.style.left = `${valueRef.current.x * 100}%`;
      handleRef.current.style.top = `${valueRef.current.y * 100}%`;
    }
  };

  useDrag(padRef, {
    preventDefault: true,
    onChange(snapshot) {
      if (snapshot.phase !== 'start' && snapshot.phase !== 'update') return;
      const width = padRef.current?.clientWidth ?? 1;
      const height = padRef.current?.clientHeight ?? 1;
      paint(valueRef.current.x + snapshot.delta.x / width, valueRef.current.y + snapshot.delta.y / height);
    },
  });

  return (
    <section className="card card-xy">
      <header><div className="card-heading"><span className="card-index">05 / VECTOR CONTROL</span><h2>XY Control</h2></div><span>2D</span></header>
      <div ref={padRef} className="xy-pad" data-testid="xy-pad">
        <div ref={handleRef} className="xy-handle" style={{ left: '50%', top: '50%' }} />
      </div>
      <p>Headless 2D position with bounded normalized output.</p>
    </section>
  );
}

function Rotary() {
  const controlRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(0);

  const paint = (degrees: number) => {
    valueRef.current = wrap(degrees, 0, 360);
    if (dialRef.current) dialRef.current.style.transform = `rotate(${valueRef.current}deg)`;
    controlRef.current?.setAttribute('aria-valuenow', String(Math.round(valueRef.current)));
  };

  useDrag(controlRef, {
    preventDefault: true,
    onChange(snapshot) {
      if (snapshot.phase !== 'start' && snapshot.phase !== 'update') return;
      const raw = valueRef.current - snapshot.delta.y * (snapshot.modifiers.shift ? 0.2 : 1.2);
      paint(stepValue(raw, snapshot.modifiers.alt ? 15 : 1));
    },
  });

  return (
    <section className="card card-rotary">
      <header><div className="card-heading"><span className="card-index">06 / ANGULAR INPUT</span><h2>Rotary + Detents</h2></div><span>0..360</span></header>
      <div ref={controlRef} className="rotary-wrap" role="slider" tabIndex={0} aria-valuemin={0} aria-valuemax={359} aria-valuenow={0}>
        <div ref={dialRef} className="rotary"><i /></div>
      </div>
      <p>Vertical drag. Shift = precision. Alt = 15° detents.</p>
    </section>
  );
}

function SpringDrag() {
  const zoneRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);
  const schedulerRef = useRef(createRafScheduler());
  const xRef = useRef(0);
  const yRef = useRef(0);
  const startRef = useRef({ x: 0, y: 0 });
  const animationX = useRef<ReturnType<typeof animateSpring> | null>(null);
  const animationY = useRef<ReturnType<typeof animateSpring> | null>(null);

  const paint = (x: number, y: number) => {
    xRef.current = x;
    yRef.current = y;
    if (objectRef.current) objectRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const returnToOrigin = () => {
    animationX.current?.cancel();
    animationY.current?.cancel();
    animationX.current = animateSpring({
      scheduler: schedulerRef.current,
      from: { position: xRef.current, velocity: 0 },
      target: 0,
      spring: { stiffness: 260, damping: 24 },
      onUpdate: (state) => paint(state.position, yRef.current),
    });
    animationY.current = animateSpring({
      scheduler: schedulerRef.current,
      from: { position: yRef.current, velocity: 0 },
      target: 0,
      spring: { stiffness: 260, damping: 24 },
      onUpdate: (state) => paint(xRef.current, state.position),
    });
  };

  useDrag(zoneRef, {
    preventDefault: true,
    onChange(snapshot) {
      if (snapshot.phase === 'start') {
        animationX.current?.cancel();
        animationY.current?.cancel();
        startRef.current = { x: xRef.current, y: yRef.current };
      }
      if (snapshot.phase === 'start' || snapshot.phase === 'update') {
        paint(startRef.current.x + snapshot.offset.x, startRef.current.y + snapshot.offset.y);
      }
      if (snapshot.phase === 'end' || snapshot.phase === 'cancel') returnToOrigin();
    },
  });

  return (
    <section className="card card-spring">
      <header><div className="card-heading"><span className="card-index">07 / MOTION PHYSICS</span><h2>Spring Return</h2></div><span>Physics</span></header>
      <div ref={zoneRef} className="spring-zone">
        <div ref={objectRef} className="spring-object">PFx</div>
      </div>
      <p>Free drag with a composable return-to-origin spring.</p>
    </section>
  );
}

function SnapControl() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const startRef = useRef(0.5);
  const valueRef = useRef(0.5);

  const paint = (value: number) => {
    const snapped = stepValue(clamp(value, 0, 1), 0.25);
    valueRef.current = snapped;
    if (thumbRef.current) thumbRef.current.style.left = `${snapped * 100}%`;
  };

  useDrag(trackRef, {
    preventDefault: true,
    onChange(snapshot) {
      if (snapshot.phase === 'start') startRef.current = valueRef.current;
      paint(startRef.current + snapshot.offset.x / (trackRef.current?.clientWidth ?? 1));
    },
  });

  return (
    <section className="card card-snap">
      <header><div className="card-heading"><span className="card-index">08 / CONSTRAINTS</span><h2>Snap Points</h2></div><span>Modifier</span></header>
      <div ref={trackRef} className="slider snap-slider">
        {[0, 25, 50, 75, 100].map((value) => <i key={value} style={{ left: `${value}%` }} />)}
        <div ref={thumbRef} className="thumb" style={{ left: '50%' }} />
      </div>
      <p>Drag input passes through a 0.25 step modifier.</p>
    </section>
  );
}

type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'pfx-interaction-lab-theme';

function readSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function App() {
  const [theme, setTheme] = useState<Theme>(readSavedTheme);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'light' ? '#f4f5f2' : '#0b0d0e',
    );
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The theme still works when browser storage is unavailable.
    }
  }, [theme]);

  return (
    <div className="app-shell" data-theme={theme}>
      <a className="skip-link" href="#experiments">Skip to experiments</a>
      <div className="site-frame">
        <nav className="topbar" aria-label="Site navigation">
          <a className="brand" href="https://pfxamd.com/" aria-label="PFxamd home">
            <img className="brand-symbol" src={`${import.meta.env.BASE_URL}logo.svg`} alt="" />
            <span className="brand-wordmark">PFx<span>amd</span></span>
          </a>
          <div className="topbar-center"><span className="topbar-square" aria-hidden="true" /> INTERACTION CORE <span className="nav-divider">/</span> PLAYGROUND</div>
          <div className="topbar-actions">
            <div className="theme-switcher" role="group" aria-label="Color theme">
              <span className="theme-switcher-label" aria-hidden="true">DISPLAY</span>
              <div className="theme-segments">
                <button
                  className="theme-option"
                  type="button"
                  aria-label="Light theme"
                  aria-pressed={theme === 'light'}
                  onClick={() => setTheme('light')}
                >
                  <span className="mode-glyph mode-glyph--light" aria-hidden="true" />
                  <span>LIGHT</span>
                </button>
                <button
                  className="theme-option"
                  type="button"
                  aria-label="Dark theme"
                  aria-pressed={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                >
                  <span className="mode-glyph mode-glyph--dark" aria-hidden="true" />
                  <span>DARK</span>
                </button>
              </div>
            </div>
            <a className="topbar-repo" aria-label="View source on GitHub" href="https://github.com/pfxamd/PFx-Interaction-Core" target="_blank" rel="noopener noreferrer"><span className="repo-text">SOURCE</span> <span aria-hidden="true">↗</span></a>
          </div>
        </nav>
        <main className="workspace">
          <section className="hero" aria-labelledby="playground-heading">
            <div className="hero-copy">
              <span className="eyebrow"><i className="indicator" aria-hidden="true" /> LIVE EXPLORATIONS / 001</span>
              <h1 id="playground-heading">Interaction <span>Playground</span><span className="hero-stop" aria-hidden="true">.</span></h1>
              <p className="hero-subtitle">An interactive field guide to movement, precision, and control. Explore the building blocks behind responsive interfaces.</p>
              <div className="hero-meta"><span><strong>08</strong> LIVE MODULES</span><span>POINTER + KEYBOARD</span><span>ENGINE v0.1.0</span></div>
              <a className="hero-cta" href="#experiments">EXPLORE THE LAB <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-diagram" aria-hidden="true">
              <div className="diagram-axis diagram-x" />
              <div className="diagram-axis diagram-y" />
              <div className="diagram-ring diagram-ring-outer" />
              <div className="diagram-ring diagram-ring-inner" />
              <div className="diagram-path">
                <svg role="img" aria-label="Signal trajectory" viewBox="0 0 440 330" preserveAspectRatio="none"><title>Signal trajectory</title><path d="M42 255 C 90 248, 125 128, 174 180 S 267 272, 308 154 S 360 72, 404 86"/><circle cx="174" cy="180" r="5"/><circle cx="308" cy="154" r="5"/></svg>
              </div>
              <div className="diagram-center"><span className="diagram-aim" /><b>PFx</b></div>
              <span className="diagram-coordinate coordinate-a">X: 0.742</span>
              <span className="diagram-coordinate coordinate-b">Y: 0.318</span>
              <span className="diagram-caption">SIGNAL SPACE / 02 AXES</span>
              <span className="diagram-corner diagram-corner-tl" />
              <span className="diagram-corner diagram-corner-br" />
            </div>
          </section>
          <section className="lab-area" id="experiments" aria-labelledby="experiments-heading">
            <div className="section-head">
              <div>
                <span className="section-overline">/ 01 — THE WORKBENCH</span>
                <h2 id="experiments-heading">Test the mechanics<span aria-hidden="true">↘</span></h2>
              </div>
              <p>Everything below is real. Drag, tap, type, and experiment.</p>
            </div>
            <div className="grid">
              <HorizontalSlider />
              <VerticalSlider />
              <XYPad />
              <Rotary />
              <FreeDrag />
              <SpringDrag />
              <SnapControl />
              <InputProbe />
            </div>
          </section>
          <section className="outro" aria-label="Explore the source">
            <div>
              <span className="section-overline">/ 02 — UNDER THE HOOD</span>
              <h2>No magic.<br/><span>Just mechanics.</span></h2>
              <p>A framework-independent core, browser sensors, and optional React bindings. Built to compose, not to dictate.</p>
            </div>
            <div className="outro-actions">
              <a href="https://github.com/pfxamd/PFx-Interaction-Core" target="_blank" rel="noopener noreferrer">EXPLORE SOURCE <span aria-hidden="true">↗</span></a>
              <a href="https://github.com/pfxamd/PFx-Interaction-Core/releases/tag/v0.1.0" target="_blank" rel="noopener noreferrer">GET v0.1.0 <span aria-hidden="true">↗</span></a>
            </div>
          </section>
        </main>
        <footer className="footer">
          <span>© PFxamd / INTERACTION CORE</span>
          <div className="footer-inputs"><span>MOUSE</span><span>TOUCH</span><span>PEN</span><span>KEYBOARD</span></div>
          <span>DESIGNED FOR REAL INPUT <i aria-hidden="true">●</i></span>
        </footer>
      </div>
    </div>
  );
}
