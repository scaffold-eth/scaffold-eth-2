"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  PALETTE_STORAGE_KEY,
  PALETTE_STYLE_ID,
  applyPalette,
  palettes,
  resetPalette,
} from "~~/components/test/palettes";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="text-2xl mb-4">{title}</h2>
    {children}
  </section>
);

const SWATCH_KEYS = ["primary", "secondary", "accent", "base-100", "base-300"] as const;

const Test: NextPage = () => {
  const [activePalette, setActivePalette] = useState<string | null>(null);

  useEffect(() => {
    const style = document.getElementById(PALETTE_STYLE_ID) as HTMLStyleElement | null;
    if (style?.dataset.palette) setActivePalette(style.dataset.palette);
  }, []);

  return (
    <div className="container mx-auto px-6 py-10 max-w-5xl">
      <h1 className="text-4xl mb-8">Theme Test Page</h1>

      <Section title="Palettes">
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {palettes.map(p => {
            const active = activePalette === p.name;
            return (
              <div key={p.name}>
                <div className={`font-medium mb-2 ${active ? "text-primary" : ""}`}>{p.name}</div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {SWATCH_KEYS.map(k => (
                      <div
                        key={k}
                        className="w-5 h-5 border border-base-content/20"
                        style={{ background: p.light[k] }}
                        title={`${k}: ${p.light[k]}`}
                      />
                    ))}
                  </div>
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      applyPalette(p);
                      localStorage.setItem(PALETTE_STORAGE_KEY, p.name);
                      setActivePalette(p.name);
                    }}
                    disabled={active}
                  >
                    {active ? "Active" : "Apply"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {activePalette && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              resetPalette();
              localStorage.removeItem(PALETTE_STORAGE_KEY);
              setActivePalette(null);
            }}
          >
            Reset
          </button>
        )}
      </Section>

      <Section title="Buttons — color variants">
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary">btn-primary</button>
          <button className="btn btn-secondary">btn-secondary</button>
          <button className="btn btn-accent">btn-accent</button>
          <button className="btn btn-neutral">btn-neutral</button>
          <button className="btn btn-info">btn-info</button>
          <button className="btn btn-success">btn-success</button>
          <button className="btn btn-warning">btn-warning</button>
          <button className="btn btn-error">btn-error</button>
          <button className="btn">btn (default)</button>
          <button className="btn btn-ghost">btn-ghost</button>
          <button className="btn btn-link">btn-link</button>
        </div>
      </Section>

      <Section title="Buttons — outline">
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-outline btn-primary">outline-primary</button>
          <button className="btn btn-outline btn-secondary">outline-secondary</button>
          <button className="btn btn-outline btn-accent">outline-accent</button>
          <button className="btn btn-outline btn-neutral">outline-neutral</button>
          <button className="btn btn-outline btn-info">outline-info</button>
          <button className="btn btn-outline btn-success">outline-success</button>
          <button className="btn btn-outline btn-warning">outline-warning</button>
          <button className="btn btn-outline btn-error">outline-error</button>
        </div>
      </Section>

      <Section title="Buttons — soft">
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-soft btn-primary">soft-primary</button>
          <button className="btn btn-soft btn-secondary">soft-secondary</button>
          <button className="btn btn-soft btn-accent">soft-accent</button>
          <button className="btn btn-soft btn-neutral">soft-neutral</button>
          <button className="btn btn-soft btn-info">soft-info</button>
          <button className="btn btn-soft btn-success">soft-success</button>
          <button className="btn btn-soft btn-warning">soft-warning</button>
          <button className="btn btn-soft btn-error">soft-error</button>
        </div>
      </Section>

      <Section title="Buttons — sizes">
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary btn-xs">btn-xs</button>
          <button className="btn btn-primary btn-sm">btn-sm</button>
          <button className="btn btn-primary btn-md">btn-md</button>
          <button className="btn btn-primary btn-lg">btn-lg</button>
        </div>
      </Section>

      <Section title="Buttons — disabled">
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary" disabled>
            disabled primary
          </button>
          <button className="btn btn-secondary" disabled>
            disabled secondary
          </button>
          <button className="btn btn-disabled">btn-disabled</button>
        </div>
      </Section>

      <Section title="Backgrounds — color">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-primary text-primary-content p-6 text-center">bg-primary</div>
          <div className="bg-secondary text-secondary-content p-6 text-center">bg-secondary</div>
          <div className="bg-accent text-accent-content p-6 text-center">bg-accent</div>
          <div className="bg-neutral text-neutral-content p-6 text-center">bg-neutral</div>
          <div className="bg-info p-6 text-center">bg-info</div>
          <div className="bg-success p-6 text-center">bg-success</div>
          <div className="bg-warning p-6 text-center">bg-warning</div>
          <div className="bg-error p-6 text-center">bg-error</div>
        </div>
      </Section>

      <Section title="Backgrounds — base shades">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-base-100 border border-base-content/10 p-6 text-center">bg-base-100</div>
          <div className="bg-base-200 border border-base-content/10 p-6 text-center">bg-base-200</div>
          <div className="bg-base-300 border border-base-content/10 p-6 text-center">bg-base-300</div>
        </div>
      </Section>

      <Section title="Text colors">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <p className="text-primary text-lg font-semibold">text-primary</p>
          <p className="text-secondary text-lg font-semibold">text-secondary</p>
          <p className="text-accent text-lg font-semibold">text-accent</p>
          <p className="text-neutral text-lg font-semibold">text-neutral</p>
          <p className="text-info text-lg font-semibold">text-info</p>
          <p className="text-success text-lg font-semibold">text-success</p>
          <p className="text-warning text-lg font-semibold">text-warning</p>
          <p className="text-error text-lg font-semibold">text-error</p>
          <p className="text-base-content text-lg font-semibold">text-base-content</p>
        </div>
      </Section>

      <Section title="Borders">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border-2 border-primary p-4 text-center">border-primary</div>
          <div className="border-2 border-secondary p-4 text-center">border-secondary</div>
          <div className="border-2 border-accent p-4 text-center">border-accent</div>
          <div className="border-2 border-neutral p-4 text-center">border-neutral</div>
          <div className="border-2 border-info p-4 text-center">border-info</div>
          <div className="border-2 border-success p-4 text-center">border-success</div>
          <div className="border-2 border-warning p-4 text-center">border-warning</div>
          <div className="border-2 border-error p-4 text-center">border-error</div>
        </div>
      </Section>

      <Section title="Fill (icons)">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex flex-col items-center gap-1">
            <BugAntIcon className="h-8 w-8 fill-primary" />
            <span className="text-xs">fill-primary</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <BugAntIcon className="h-8 w-8 fill-secondary" />
            <span className="text-xs">fill-secondary</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <BugAntIcon className="h-8 w-8 fill-accent" />
            <span className="text-xs">fill-accent</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <BugAntIcon className="h-8 w-8 fill-neutral" />
            <span className="text-xs">fill-neutral</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-base-100 p-2">
            <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
            <span className="text-xs">fill-secondary on base-100</span>
          </div>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="flex flex-col gap-4 max-w-md">
          <input type="text" placeholder="input" className="input input-bordered" />
          <input type="text" placeholder="input-primary" className="input input-bordered input-primary" />
          <select className="select select-bordered">
            <option>select</option>
          </select>
          <div className="flex gap-3 items-center">
            <input type="checkbox" className="checkbox" defaultChecked />
            <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
            <input type="checkbox" className="checkbox checkbox-secondary" defaultChecked />
            <input type="checkbox" className="checkbox checkbox-accent" defaultChecked />
          </div>
          <div className="flex gap-3 items-center">
            <input type="radio" name="r" className="radio" defaultChecked />
            <input type="radio" name="r" className="radio radio-primary" />
            <input type="radio" name="r" className="radio radio-secondary" />
          </div>
          <div className="flex gap-3 items-center">
            <input type="checkbox" className="toggle" defaultChecked />
            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            <input type="checkbox" className="toggle toggle-secondary" defaultChecked />
            <input type="checkbox" className="toggle toggle-accent" defaultChecked />
          </div>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-3">
          <span className="badge badge-primary">badge-primary</span>
          <span className="badge badge-secondary">badge-secondary</span>
          <span className="badge badge-accent">badge-accent</span>
          <span className="badge badge-neutral">badge-neutral</span>
          <span className="badge badge-info">badge-info</span>
          <span className="badge badge-success">badge-success</span>
          <span className="badge badge-warning">badge-warning</span>
          <span className="badge badge-error">badge-error</span>
        </div>
      </Section>

      <Section title="Alerts">
        <div className="flex flex-col gap-3">
          <div className="alert alert-info">alert-info</div>
          <div className="alert alert-success">alert-success</div>
          <div className="alert alert-warning">alert-warning</div>
          <div className="alert alert-error">alert-error</div>
        </div>
      </Section>

      <Section title="Card on bg-base-100">
        <div className="bg-base-100 border border-base-300 p-6 max-w-md">
          <h3 className="text-xl mb-2">Card title</h3>
          <p className="mb-4">Body text on base-100. Border uses base-300.</p>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm">Primary</button>
            <button className="btn btn-secondary btn-sm">Secondary</button>
            <button className="btn btn-ghost btn-sm">Ghost</button>
          </div>
        </div>
      </Section>

      <Section title="Links">
        <div className="flex flex-col gap-2">
          <a className="link">link (default)</a>
          <a className="link link-primary">link-primary</a>
          <a className="link link-secondary">link-secondary</a>
          <a className="link link-accent">link-accent</a>
        </div>
      </Section>
    </div>
  );
};

export default Test;
