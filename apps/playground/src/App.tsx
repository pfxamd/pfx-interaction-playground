import { useEffect, useState } from 'react';
import {
  DragControl,
  InputProbe,
  RotaryControl,
  ScalarControl,
  XYControl,
} from './components/Controls';

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
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'light' ? '#f4f5f2' : '#0b0d0e');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The theme still works when browser storage is unavailable.
    }
  }, [theme]);

  return (
    <div className="app-shell" data-theme={theme}>
      <a className="skip-link" href="#experiments">
        Skip to experiments
      </a>
      <div className="site-frame">
        <nav className="topbar" aria-label="Site navigation">
          <a
            className="brand"
            href={import.meta.env.BASE_URL}
            aria-label="PFx Interaction Lab home"
          >
            <img className="brand-symbol" src={`${import.meta.env.BASE_URL}logo.svg`} alt="" />
            <span className="brand-wordmark">
              <span className="brand-prefix">PFx</span>
              <span className="brand-title">Interaction Lab</span>
              <span className="alpha-badge">Alpha 0.1</span>
            </span>
          </a>
          <div className="topbar-center">
            <span className="topbar-square" aria-hidden="true" /> INTERACTION CORE{' '}
            <span className="nav-divider">/</span> PLAYGROUND
          </div>
          <div className="topbar-actions">
            <div className="theme-switcher">
              <span className="theme-switcher-label" aria-hidden="true">
                DISPLAY
              </span>
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
            <a
              className="topbar-repo"
              aria-label="View source on GitHub"
              href="https://github.com/pfxamd/PFx-Interaction-Core"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="repo-text">SOURCE</span> <span aria-hidden="true">↗</span>
            </a>
          </div>
        </nav>
        <main className="workspace">
          <section className="hero" aria-labelledby="playground-heading">
            <div className="hero-copy">
              <span className="eyebrow">
                <i className="indicator" aria-hidden="true" /> LIVE EXPLORATIONS / 001
              </span>
              <h1 id="playground-heading">
                Interaction{' '}
                <span>
                  Playground
                  <span className="hero-stop" aria-hidden="true">
                    .
                  </span>
                </span>
              </h1>
              <p className="hero-subtitle">
                An interactive field guide to movement, precision, and control. Explore the building
                blocks behind responsive interfaces.
              </p>
              <div className="hero-meta">
                <span>
                  <strong>08</strong> LIVE MODULES
                </span>
                <span>POINTER + KEYBOARD</span>
                <span>ENGINE v0.1.0</span>
              </div>
              <a className="hero-cta" href="#experiments">
                EXPLORE THE LAB <span aria-hidden="true">↓</span>
              </a>
            </div>
            <XYControl hero />
          </section>
          <section className="lab-area" id="experiments" aria-labelledby="experiments-heading">
            <div className="section-head">
              <div>
                <span className="section-overline">/ 01 — THE WORKBENCH</span>
                <h2 id="experiments-heading">
                  Test the mechanics<span aria-hidden="true">↘</span>
                </h2>
              </div>
              <p>Eight experiments. Live values. Pointer and keyboard control.</p>
            </div>
            <div className="grid">
              <ScalarControl />
              <ScalarControl vertical />
              <XYControl />
              <RotaryControl />
              <DragControl />
              <DragControl spring />
              <ScalarControl snap />
              <InputProbe />
            </div>
          </section>
          <section className="outro" aria-label="Explore the source">
            <div>
              <span className="section-overline">/ 02 — UNDER THE HOOD</span>
              <h2>
                No magic.
                <br />
                <span>Just mechanics.</span>
              </h2>
              <p>
                A framework-independent core, browser sensors, and optional React bindings. Built to
                compose, not to dictate.
              </p>
            </div>
            <div className="outro-actions">
              <a
                href="https://github.com/pfxamd/PFx-Interaction-Core"
                target="_blank"
                rel="noopener noreferrer"
              >
                EXPLORE SOURCE <span aria-hidden="true">↗</span>
              </a>
              <a
                href="https://github.com/pfxamd/PFx-Interaction-Core/releases/tag/v0.1.0"
                target="_blank"
                rel="noopener noreferrer"
              >
                GET v0.1.0 <span aria-hidden="true">↗</span>
              </a>
            </div>
          </section>
        </main>
        <footer className="footer">
          <span>Built by <a href="https://pfxamd.com/">PFxamd</a></span>
          <div className="footer-inputs">
            <span>MOUSE</span>
            <span>TOUCH</span>
            <span>PEN</span>
            <span>KEYBOARD</span>
          </div>
          <span>
            DESIGNED FOR REAL INPUT <i aria-hidden="true">●</i>
          </span>
        </footer>
      </div>
    </div>
  );
}
