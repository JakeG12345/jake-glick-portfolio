"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./studio.module.css";

type Json = Record<string, unknown>;
type Tab = "projects" | "city" | "site";

type Payload = {
  projects: Json[];
  city: Json[];
  site: Json;
};

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "projects", label: "Projects" },
  { id: "city", label: "Map stops" },
  { id: "site", label: "Site copy" },
];

const TIERS = ["flagship", "built", "artifact", "learning"];
const LINK_KINDS = ["repo", "live", "video", "store"];

const str = (value: unknown) => (typeof value === "string" ? value : "");
const list = (value: unknown) => (Array.isArray(value) ? (value as string[]) : []);

/* ---------- small field primitives ---------- */

function Text({
  label,
  value,
  onChange,
  readOnly,
  wide,
}: {
  label: string;
  value: string;
  onChange?: (next: string) => void;
  readOnly?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={`${styles.field} ${wide ? styles.wide : ""}`}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className={`${styles.field} ${styles.wide}`}>
      <span className={styles.label}>{label}</span>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (next: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <select className={styles.select} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.includes(value) ? null : <option value={value}>{value || "—"}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Num({
  label,
  value,
  onChange,
  step = 0.05,
}: {
  label: string;
  value: number | undefined;
  onChange: (next: number | undefined) => void;
  step?: number;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))}
      />
    </label>
  );
}

function Colour({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#888888";
  return (
    <div className={styles.field}>
      <span className={styles.label}>Colour</span>
      <div className={styles.colorRow}>
        <input type="color" value={safe} onChange={(event) => onChange(event.target.value)} />
        <input className={styles.input} value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}

function StringList({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className={`${styles.field} ${styles.wide}`}>
      <span className={styles.label}>{label}</span>
      <div className={styles.chips}>
        {values.map((entry, index) => (
          <div className={styles.chip} key={index}>
            <input
              className={styles.input}
              value={entry}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <button
              className={styles.iconButton}
              type="button"
              aria-label={`Remove ${label} item ${index + 1}`}
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </div>
        ))}
        <button className={styles.addButton} type="button" onClick={() => onChange([...values, ""])}>
          + Add {label.toLowerCase()}
        </button>
      </div>
    </div>
  );
}

/* ---------- editors ---------- */

function ProjectForm({ value, onChange }: { value: Json; onChange: (next: Json) => void }) {
  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next });
  const links = Array.isArray(value.links) ? (value.links as Json[]) : [];

  return (
    <>
      <p className={styles.groupTitle}>Identity</p>
      <div className={styles.grid}>
        <Text label="ID (not editable)" value={str(value.id)} readOnly />
        <Text label="Title" value={str(value.title)} onChange={(v) => set("title", v)} />
        <Text label="Short title" value={str(value.shortTitle)} onChange={(v) => set("shortTitle", v)} />
        <Text label="Year" value={str(value.year)} onChange={(v) => set("year", v)} />
        <Text label="Zone" value={str(value.zone)} onChange={(v) => set("zone", v)} />
        <Text label="Category" value={str(value.category)} onChange={(v) => set("category", v)} />
        <Select label="Tier" value={str(value.tier)} options={TIERS} onChange={(v) => set("tier", v)} />
        <Text label="Status" value={str(value.status)} onChange={(v) => set("status", v)} />
        <Colour value={str(value.color)} onChange={(v) => set("color", v)} />
      </div>

      <p className={styles.groupTitle}>Copy</p>
      <div className={styles.grid}>
        <Area label="Summary (archive card)" value={str(value.summary)} onChange={(v) => set("summary", v)} />
        <Area label="Detail (popup card)" value={str(value.detail)} onChange={(v) => set("detail", v)} />
      </div>

      <p className={styles.groupTitle}>Evidence</p>
      <div className={styles.grid}>
        <StringList label="Stack" values={list(value.stack)} onChange={(v) => set("stack", v)} />
        <StringList label="Proof" values={list(value.proof)} onChange={(v) => set("proof", v)} />
        <Text label="Source" value={str(value.source)} onChange={(v) => set("source", v)} />
        <Text label="Image override" value={str(value.image)} onChange={(v) => set("image", v)} />
      </div>

      <p className={styles.groupTitle}>Links</p>
      <div className={styles.chips}>
        {links.map((link, index) => (
          <div className={styles.subCard} key={index}>
            <div className={styles.grid}>
              <Text
                label="Label"
                value={str(link.label)}
                onChange={(v) => {
                  const next = [...links];
                  next[index] = { ...link, label: v };
                  set("links", next);
                }}
              />
              <Select
                label="Kind"
                value={str(link.kind)}
                options={LINK_KINDS}
                onChange={(v) => {
                  const next = [...links];
                  next[index] = { ...link, kind: v };
                  set("links", next);
                }}
              />
              <Text
                label="URL"
                wide
                value={str(link.href)}
                onChange={(v) => {
                  const next = [...links];
                  next[index] = { ...link, href: v };
                  set("links", next);
                }}
              />
            </div>
            <button
              className={styles.addButton}
              type="button"
              onClick={() => set("links", links.filter((_, i) => i !== index))}
            >
              Remove link
            </button>
          </div>
        ))}
        <button
          className={styles.addButton}
          type="button"
          onClick={() => set("links", [...links, { label: "", href: "", kind: "repo" }])}
        >
          + Add link
        </button>
      </div>
    </>
  );
}

function CityForm({ value, onChange }: { value: Json; onChange: (next: Json) => void }) {
  const content = (value.content ?? {}) as Json;
  const setContent = (key: string, next: unknown) =>
    onChange({ ...value, content: { ...content, [key]: next } });
  const featured = value.base === "featured";

  return (
    <>
      <p className={styles.groupTitle}>Placement (set in code)</p>
      <div className={styles.grid}>
        <Text label="ID" value={str(value.id)} readOnly />
        <Text label="Plot" value={str(value.plot)} readOnly />
        <Text
          label="Base"
          value={featured ? "overrides a project" : "standalone landmark"}
          readOnly
        />
        <Num label="Height" value={value.height as number} onChange={(v) => onChange({ ...value, height: v })} />
        <Num
          label="Heading (radians)"
          step={0.005}
          value={value.heading as number | undefined}
          onChange={(v) =>
            onChange(v === undefined ? omit(value, "heading") : { ...value, heading: v })
          }
        />
      </div>

      <p className={styles.groupTitle}>
        {featured ? "Overrides — blank fields fall back to the project" : "Landmark content"}
      </p>
      <div className={styles.grid}>
        <Text label="Title" value={str(content.title)} onChange={(v) => setContent("title", v)} />
        <Text label="Short title" value={str(content.shortTitle)} onChange={(v) => setContent("shortTitle", v)} />
        <Text label="Year" value={str(content.year)} onChange={(v) => setContent("year", v)} />
        <Text label="Zone" value={str(content.zone)} onChange={(v) => setContent("zone", v)} />
        <Text label="Category" value={str(content.category)} onChange={(v) => setContent("category", v)} />
        <Select label="Tier" value={str(content.tier)} options={TIERS} onChange={(v) => setContent("tier", v)} />
        <Text label="Status" value={str(content.status)} onChange={(v) => setContent("status", v)} />
        <Colour value={str(content.color)} onChange={(v) => setContent("color", v)} />
        <Area label="Summary" value={str(content.summary)} onChange={(v) => setContent("summary", v)} />
        <Area label="Detail" value={str(content.detail)} onChange={(v) => setContent("detail", v)} />
        <StringList label="Stack" values={list(content.stack)} onChange={(v) => setContent("stack", v)} />
        <StringList label="Proof" values={list(content.proof)} onChange={(v) => setContent("proof", v)} />
        <Text label="Source" value={str(content.source)} onChange={(v) => setContent("source", v)} />
      </div>
      <p className={styles.groupTitle}>
        Category “Landmark” means this stop travels the camera without opening a card.
      </p>
    </>
  );
}

function omit(value: Json, key: string): Json {
  const next = { ...value };
  delete next[key];
  return next;
}

function SiteForm({ value, onChange }: { value: Json; onChange: (next: Json) => void }) {
  const hero = (value.hero ?? {}) as Json;
  const stats = (value.stats ?? {}) as Json;
  const sections = (value.sections ?? {}) as Json;
  const contacts = Array.isArray(value.contactLinks) ? (value.contactLinks as Json[]) : [];
  const experiences = Array.isArray(value.experiences) ? (value.experiences as Json[]) : [];

  const setSection = (name: string, key: string, next: string) => {
    const section = (sections[name] ?? {}) as Json;
    onChange({ ...value, sections: { ...sections, [name]: { ...section, [key]: next } } });
  };

  return (
    <>
      <p className={styles.groupTitle}>Hero</p>
      <div className={styles.grid}>
        <Text label="Kicker" value={str(hero.kicker)} onChange={(v) => onChange({ ...value, hero: { ...hero, kicker: v } })} />
        <Text label="Name" value={str(hero.name)} onChange={(v) => onChange({ ...value, hero: { ...hero, name: v } })} />
        <Area label="Intro" value={str(hero.intro)} onChange={(v) => onChange({ ...value, hero: { ...hero, intro: v } })} />
      </div>

      <p className={styles.groupTitle}>Stats — map stops and archive items are counted automatically</p>
      <div className={styles.grid}>
        <Text label="Public repos" value={str(stats.repos)} onChange={(v) => onChange({ ...value, stats: { ...stats, repos: v } })} />
        <Text label="Grad year" value={str(stats.gradYear)} onChange={(v) => onChange({ ...value, stats: { ...stats, gradYear: v } })} />
        <Text label="Grad label" value={str(stats.gradLabel)} onChange={(v) => onChange({ ...value, stats: { ...stats, gradLabel: v } })} />
      </div>

      {(["archive", "experience", "contact"] as const).map((name) => {
        const section = (sections[name] ?? {}) as Json;
        return (
          <div key={name}>
            <p className={styles.groupTitle}>{name} section</p>
            <div className={styles.grid}>
              <Text label="Eyebrow" value={str(section.eyebrow)} onChange={(v) => setSection(name, "eyebrow", v)} />
              <Text label="Heading" wide value={str(section.heading)} onChange={(v) => setSection(name, "heading", v)} />
              {"intro" in section ? (
                <Area label="Intro" value={str(section.intro)} onChange={(v) => setSection(name, "intro", v)} />
              ) : null}
            </div>
          </div>
        );
      })}

      <p className={styles.groupTitle}>Contact links — the icon follows the label</p>
      <div className={styles.chips}>
        {contacts.map((link, index) => (
          <div className={styles.subCard} key={index}>
            <div className={styles.grid}>
              <Text
                label="Label"
                value={str(link.label)}
                onChange={(v) => {
                  const next = [...contacts];
                  next[index] = { ...link, label: v };
                  onChange({ ...value, contactLinks: next });
                }}
              />
              <Text
                label="URL"
                value={str(link.href)}
                onChange={(v) => {
                  const next = [...contacts];
                  next[index] = { ...link, href: v };
                  onChange({ ...value, contactLinks: next });
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className={styles.groupTitle}>Experience</p>
      <div className={styles.chips}>
        {experiences.map((item, index) => {
          const update = (key: string, next: string) => {
            const copy = [...experiences];
            copy[index] = { ...item, [key]: next };
            onChange({ ...value, experiences: copy });
          };
          return (
            <div className={styles.subCard} key={index}>
              <div className={styles.grid}>
                <Text label="Role" value={str(item.role)} onChange={(v) => update("role", v)} />
                <Text label="Company" value={str(item.company)} onChange={(v) => update("company", v)} />
                <Text label="Date" value={str(item.date)} onChange={(v) => update("date", v)} />
                <Area label="Detail" value={str(item.detail)} onChange={(v) => update("detail", v)} />
              </div>
              <button
                className={styles.addButton}
                type="button"
                onClick={() => onChange({ ...value, experiences: experiences.filter((_, i) => i !== index) })}
              >
                Remove role
              </button>
            </div>
          );
        })}
        <button
          className={styles.addButton}
          type="button"
          onClick={() =>
            onChange({
              ...value,
              experiences: [...experiences, { role: "", company: "", date: "", detail: "" }],
            })
          }
        >
          + Add role
        </button>
      </div>

      <p className={styles.groupTitle}>Footer</p>
      <StringList
        label="Footer lines"
        values={list(value.footer)}
        onChange={(v) => onChange({ ...value, footer: v })}
      />
    </>
  );
}

/* ---------- shell ---------- */

export default function Studio() {
  const [data, setData] = useState<Payload | null>(null);
  const [tab, setTab] = useState<Tab>("projects");
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [dirty, setDirty] = useState<Record<Tab, boolean>>({ projects: false, city: false, site: false });
  const [note, setNote] = useState<{ tone: string; text: string }>({ tone: "idle", text: "" });

  useEffect(() => {
    fetch("/api/studio")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Load failed"))))
      .then(setData)
      .catch(() => setNote({ tone: "error", text: "Could not load content" }));
  }, []);

  const anyDirty = dirty.projects || dirty.city || dirty.site;
  useEffect(() => {
    if (!anyDirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyDirty]);

  const rows = useMemo(() => {
    if (!data || tab === "site") return [];
    const items = tab === "projects" ? data.projects : data.city;
    const clean = query.trim().toLowerCase();
    return items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (!clean) return true;
        const title = tab === "projects" ? str(item.title) : str((item.content as Json)?.title) || str(item.id);
        return `${str(item.id)} ${title}`.toLowerCase().includes(clean);
      });
  }, [data, tab, query]);

  if (!data) {
    return (
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <span className={styles.brand}>Studio</span>
        </div>
        <p className={styles.empty}>{note.text || "Loading content…"}</p>
      </div>
    );
  }

  const updateItem = (next: Json) => {
    if (tab === "site") {
      setData({ ...data, site: next });
    } else {
      const items = [...(tab === "projects" ? data.projects : data.city)];
      items[selected] = next;
      setData(tab === "projects" ? { ...data, projects: items } : { ...data, city: items });
    }
    setDirty({ ...dirty, [tab]: true });
    setNote({ tone: "dirty", text: "Unsaved changes" });
  };

  const save = async () => {
    setNote({ tone: "idle", text: "Saving…" });
    const body = tab === "projects" ? data.projects : tab === "city" ? data.city : data.site;
    try {
      const response = await fetch(`/api/studio?file=${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Save failed");
      setDirty({ ...dirty, [tab]: false });
      setNote({ tone: "saved", text: `Saved ${result.saved}.json — the site reloads itself` });
    } catch (error) {
      setNote({ tone: "error", text: error instanceof Error ? error.message : "Save failed" });
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (dirty[tab]) void save();
    }
  };

  const current =
    tab === "site" ? data.site : (tab === "projects" ? data.projects : data.city)[selected];

  return (
    <div className={styles.shell} onKeyDown={onKeyDown}>
      <div className={styles.topbar}>
        <span className={styles.brand}>Studio</span>
        <span className={styles.brandNote}>app/data/{tab}.json</span>
        <div className={styles.tabs}>
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={styles.tab}
              data-active={tab === entry.id}
              onClick={() => {
                setTab(entry.id);
                setSelected(0);
                setQuery("");
              }}
            >
              {entry.label}
              {dirty[entry.id] ? " •" : ""}
            </button>
          ))}
        </div>
        <span className={styles.spacer} />
        <span className={styles.status} data-tone={note.tone}>
          {note.text}
        </span>
        <a className={styles.viewLink} href="/" target="_blank" rel="noreferrer">
          View site ↗
        </a>
        <button className={styles.save} type="button" disabled={!dirty[tab]} onClick={save} title="Save (⌘S)">
          Save
        </button>
      </div>

      <div className={styles.body}>
        {tab === "site" ? (
          <div className={styles.list}>
            <p className={styles.empty}>Everything on this tab is one file.</p>
          </div>
        ) : (
          <div className={styles.list}>
            <input
              className={styles.search}
              value={query}
              placeholder="Search…"
              onChange={(event) => setQuery(event.target.value)}
            />
            {rows.map(({ item, index }) => {
              const content = (item.content ?? {}) as Json;
              const title = tab === "projects" ? str(item.title) : str(content.title) || str(item.id);
              const meta =
                tab === "projects"
                  ? `${str(item.year)} · ${str(item.tier)}`
                  : `${str(item.plot)} · ${str(item.base)}`;
              return (
                <button
                  key={str(item.id) || index}
                  type="button"
                  className={styles.row}
                  data-active={index === selected}
                  onClick={() => setSelected(index)}
                >
                  <span className={styles.rowTitle}>{title || str(item.id)}</span>
                  <span className={styles.rowMeta}>{meta}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className={styles.editor}>
          {tab === "projects" ? <ProjectForm value={current as Json} onChange={updateItem} /> : null}
          {tab === "city" ? <CityForm value={current as Json} onChange={updateItem} /> : null}
          {tab === "site" ? <SiteForm value={current as Json} onChange={updateItem} /> : null}
        </div>
      </div>
    </div>
  );
}
