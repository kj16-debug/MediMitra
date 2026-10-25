import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { AnalyzeRequest, DemoPatient, Status, TriageResult, Vitals } from './types';

const emptyVitals: Vitals = {
  temp_c: null,
  pulse_bpm: null,
  spo2_pct: null,
  systolic_bp: null,
  resp_rate: null,
};

const blank: AnalyzeRequest = {
  text: '',
  age_years: null,
  sex: 'unknown',
  pregnant: null,
  vitals: { ...emptyVitals },
  output_language: 'English',
};

function App() {
  const [form, setForm] = useState<AnalyzeRequest>(blank);
  const [demos, setDemos] = useState<DemoPatient[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [cloud, setCloud] = useState<TriageResult | null>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [browserOnline, setBrowserOnline] = useState(navigator.onLine);

  useEffect(() => {
    const refresh = () => api.status().then(setStatus).catch(() => setStatus(null));
    const online = () => {
      setBrowserOnline(true);
      refresh();
    };
    const offline = () => {
      setBrowserOnline(false);
      refresh();
    };

    refresh();
    api.demos().then(setDemos).catch(() => {});
    const timer = setInterval(refresh, 10000);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  const set = (key: keyof AnalyzeRequest, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setVital = (key: keyof Vitals, value: string) =>
    setForm((prev) => ({
      ...prev,
      vitals: { ...prev.vitals, [key]: value === '' ? null : Number(value) },
    }));

  async function analyze() {
    if (!form.text.trim()) {
      setError('Add a short symptom description before analyzing.');
      return;
    }
    setBusy('analyze');
    setError('');
    setCloud(null);
    try {
      setResult(await api.analyze(form));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not analyze. Please assess manually.');
    } finally {
      setBusy('');
    }
  }

  async function escalate() {
    if (!result) return;
    setBusy('cloud');
    setError('');
    try {
      setCloud(await api.escalate(form, result));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cloud escalation unavailable. Local result remains available.');
    } finally {
      setBusy('');
    }
  }

  function loadDemo(name: string) {
    const demo = demos.find((item) => item.name === name);
    if (!demo) return;
    const { name: _name, ...request } = demo;
    setForm(request);
    setSelected(name);
    setResult(null);
    setCloud(null);
    setError('');
  }

  const ready = useMemo(() => Boolean(form.text.trim()), [form.text]);
  const statusLabel = status?.simulated
    ? 'DEMO · ESCALATION SIMULATED'
    : !status
      ? 'BACKEND UNAVAILABLE'
      : !status.local_ok
        ? 'LOCAL MODEL UNAVAILABLE'
        : browserOnline && status.cloud_ok
          ? 'ONLINE · ESCALATION AVAILABLE'
          : 'LOCAL MODE · ESCALATION UNAVAILABLE';
  const statusDetail = status?.simulated
    ? 'SIMULATED GEMMA 4 · NO MODEL CALLED'
    : status?.local_model || 'Start backend on port 8000';

  return (
    <main className="shell">
      <header className="top">
        <a className="brand" href="#top" aria-label="MediMitra home">
          <div className="brand-icon" aria-hidden="true"><span>+</span></div>
          <div>
            <div className="eyebrow">COMMUNITY CARE · FIELD NOTES</div>
            <h1>Medi<span>Mitra</span></h1>
          </div>
        </a>
        <nav className="top-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a className="nav-cta" href="#intake">Open workspace <span aria-hidden="true">↘</span></a>
        </nav>
        <div className={`status ${status?.simulated || !status?.local_ok || !browserOnline || !status.cloud_ok ? 'offline' : 'online'}`}>
          <i aria-hidden="true" />
          <div><strong>{statusLabel}</strong><small>{statusDetail}</small></div>
        </div>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="hero-kicker"><i aria-hidden="true" /> A SUPPORTIVE TOOL FOR COMMUNITY CARE</span>
          <h2 id="hero-title">Care starts with <em>listening.</em></h2>
          <p className="hero-description">
            Turn a patient’s story into a clearer handoff. Capture symptoms, surface safety signals,
            and prepare for the next conversation.
          </p>
          <div className="hero-actions">
            <a className="primary hero-primary" href="#intake">Start a case <span aria-hidden="true">→</span></a>
            <a className="text-link" href="#demo-cases">Explore a demo case <span aria-hidden="true">↘</span></a>
          </div>
          <div className="hero-assurance" aria-label="Product principles">
            <span><b aria-hidden="true">✓</b> Human review stays central</span>
            <span><b aria-hidden="true">✓</b> Local-first workflow</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="How MediMitra supports a clinical handoff">
          <div className="visual-glow" aria-hidden="true" />
          <div className="visual-orbit orbit-one" aria-hidden="true" />
          <div className="visual-orbit orbit-two" aria-hidden="true" />
          <div className="visual-cross cross-one" aria-hidden="true">+</div>
          <div className="visual-cross cross-two" aria-hidden="true">+</div>
          <div className="preview-card">
            <div className="preview-topline">
              <span className="preview-mark" aria-hidden="true">✳</span>
              <span>THE MEDIMITRA APPROACH</span>
              <span className="preview-badge"><i aria-hidden="true" /> HUMAN-LED</span>
            </div>
            <div className="preview-heading">
              <span className="kicker">A CLEARER NEXT STEP</span>
              <h3>From first words<br />to thoughtful care.</h3>
            </div>
            <div className="preview-steps" id="how-it-works">
              <div className="preview-step">
                <span className="step-number">01</span>
                <span className="step-icon story-icon" aria-hidden="true">⌁</span>
                <span className="step-copy"><b>Listen to the story</b><small>Symptoms and context</small></span>
                <span className="step-arrow" aria-hidden="true">↗</span>
              </div>
              <div className="preview-step">
                <span className="step-number">02</span>
                <span className="step-icon safety-icon" aria-hidden="true">✳</span>
                <span className="step-copy"><b>Notice safety signals</b><small>Red flags stay visible</small></span>
                <span className="step-arrow" aria-hidden="true">↗</span>
              </div>
              <div className="preview-step">
                <span className="step-number">03</span>
                <span className="step-icon handoff-icon" aria-hidden="true">→</span>
                <span className="step-copy"><b>Prepare the handoff</b><small>A note ready to review</small></span>
                <span className="step-arrow" aria-hidden="true">↗</span>
              </div>
            </div>
            <div className="preview-footer"><span aria-hidden="true">✦</span> Support for the conversation, not a substitute for care.</div>
          </div>
          <div className="visual-caption"><span className="caption-dot" /> LOCAL-FIRST, FOCUSED, HUMAN-CENTERED</div>
        </div>
      </section>

      <section className="workspace-intro" aria-labelledby="workspace-title">
        <div>
          <span className="kicker">THE WORKSPACE</span>
          <h2 id="workspace-title">A thoughtful handoff, in three steps.</h2>
          <p>Start with what you know. Leave anything unknown blank.</p>
        </div>
        <a href="#demo-cases" className="workspace-demo-link">New here? Try a fictional case <span aria-hidden="true">↘</span></a>
      </section>

      <div className="workspace" id="intake">
        <section className="panel intake" aria-labelledby="intake-title">
          <div className="panel-heading">
            <div><span className="kicker">PATIENT INTAKE</span><h3 id="intake-title">Start with their words</h3></div>
            <span className="step">01 / 03</span>
          </div>
          <label className="field-label" htmlFor="symptoms-input">SYMPTOMS &amp; CONCERNS <span>Required</span></label>
          <textarea id="symptoms-input" value={form.text} onChange={(e) => set('text', e.target.value)} placeholder="Describe what the patient is experiencing, in their own words…" rows={5} />
          <div className="demo-row">
            <label htmlFor="demo-cases">TRY A FICTIONAL CASE</label>
            <select id="demo-cases" value={selected} onChange={(e) => loadDemo(e.target.value)}>
              <option value="">Load demo patient…</option>
              {demos.map((demo) => <option key={demo.name}>{demo.name}</option>)}
            </select>
          </div>
          <div className="grid two">
            <Field label="AGE" unit="years"><input type="number" min="0" max="120" value={form.age_years ?? ''} onChange={(e) => set('age_years', e.target.value === '' ? null : Number(e.target.value))} /></Field>
            <Field label="SEX"><select value={form.sex} onChange={(e) => set('sex', e.target.value)}><option value="unknown">Unknown</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></Field>
          </div>
          <label className="check"><input type="checkbox" checked={form.pregnant === true} onChange={(e) => set('pregnant', e.target.checked ? true : null)} /><span>Patient is pregnant</span><small>Optional</small></label>
          <div className="subheading"><span>VITALS</span><small>Leave blank if unknown</small></div>
          <div className="grid four">
            <Field label="TEMP" unit="°C"><input type="number" step="0.1" value={form.vitals.temp_c ?? ''} onChange={(e) => setVital('temp_c', e.target.value)} /></Field>
            <Field label="PULSE" unit="bpm"><input type="number" value={form.vitals.pulse_bpm ?? ''} onChange={(e) => setVital('pulse_bpm', e.target.value)} /></Field>
            <Field label="SpO₂" unit="%"><input type="number" value={form.vitals.spo2_pct ?? ''} onChange={(e) => setVital('spo2_pct', e.target.value)} /></Field>
            <Field label="BP · SYS" unit="mmHg"><input type="number" value={form.vitals.systolic_bp ?? ''} onChange={(e) => setVital('systolic_bp', e.target.value)} /></Field>
          </div>
          <div className="language">
            <label className="field-label" htmlFor="output-language">OUTPUT LANGUAGE</label>
            <select id="output-language" value={form.output_language} onChange={(e) => set('output_language', e.target.value)}>{['English', 'Hindi', 'Marathi', 'Bengali', 'Tamil', 'Telugu'].map((language) => <option key={language}>{language}</option>)}</select>
            <small>Demo output uses English. Translation requires a configured model.</small>
          </div>
          <button className="primary analyze-button" disabled={!ready || busy !== ''} onClick={analyze}>
            {busy === 'analyze' ? <><span className="spinner" /> Creating structured summary…</> : <>Analyze case <span>→</span></>}
          </button>
          <p className="privacy"><span aria-hidden="true">⌑</span> Demo data stays in memory and is not saved to disk.</p>
        </section>

        <section className="panel result-panel" aria-labelledby="result-title">
          <div className="panel-heading">
            <div><span className="kicker">TRIAGE SUMMARY</span><h3 id="result-title">Case overview</h3></div>
            <span className="step">02 / 03</span>
          </div>
          {error && <div className="error" role="alert">{error}</div>}
          {!result
            ? <div className="empty"><div className="empty-art"><span>✳</span><i /><i /><i /></div><h4>Your case summary will appear here</h4><p>Enter symptoms or load a fictional demo patient to see the structured handoff.</p><div className="empty-rule" /><small>AI supports the workflow. Safety rules protect it.</small></div>
            : <Result result={result} onEscalate={escalate} cloudEnabled={Boolean(status?.cloud_ok)} cloudModel={status?.cloud_model || 'Gemma 4 26B A4B IT'} simulated={Boolean(status?.simulated)} loading={busy === 'cloud'} cloud={cloud} />}
        </section>
      </div>

      <footer><span>DECISION-SUPPORT PROTOTYPE · NOT A DIAGNOSTIC TOOL · MOCK DATA ONLY</span><span>MediMitra <b>·</b> PRIVATE FIELD SUPPORT</span></footer>
    </main>
  );
}

function Field({ label, unit, children }: { label: string; unit?: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}{unit && <small>{unit}</small>}</span>{children}</label>;
}

function Result({ result: r, onEscalate, cloudEnabled, cloudModel, simulated, loading, cloud }: { result: TriageResult; onEscalate: () => void; cloudEnabled: boolean; cloudModel: string; simulated: boolean; loading: boolean; cloud: TriageResult | null }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(r.referral_note);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return <>
    <div className={`urgency ${r.urgency}`}><div><span className="kicker">URGENCY · {r.source === 'local' ? 'LOCAL ANALYSIS' : 'CLOUD SECOND OPINION'}</span><strong>{r.urgency.toUpperCase()}</strong></div><p>{r.urgency_reason}</p></div>
    {r.rule_reasons.length > 0 && <div className="rulebox"><strong>⚑ &nbsp;Safety rule triggered</strong>{r.rule_reasons.map((reason) => <span key={reason}>{reason}</span>)}</div>}
    <div className="detail"><span className="kicker">CHIEF COMPLAINT</span><b>{r.chief_complaint}</b>{r.duration && <small>Duration noted: {r.duration}</small>}</div>
    <div className="detail"><span className="kicker">SYMPTOMS REPORTED</span><div className="chips">{r.symptoms.map((symptom) => <span key={symptom}>{symptom}</span>)}</div></div>
    {r.red_flags.length > 0 && <div className="detail"><span className="kicker">RED FLAGS</span><div className="chips flags">{r.red_flags.map((flag) => <span key={flag}>{flag}</span>)}</div></div>}
    <div className="text-card"><span className="kicker">PLAIN-LANGUAGE SUMMARY</span><p>{r.summary_plain}</p></div>
    <div className="referral"><div className="referral-head"><span className="kicker">REFERRAL NOTE</span><button onClick={copy}>{copied ? 'COPIED ✓' : 'COPY ↗'}</button></div><p>{r.referral_note}</p></div>
    <div className="questions"><span className="kicker">FOLLOW-UP QUESTIONS</span>{r.suggested_questions.map((question, index) => <p key={question}><b>0{index + 1}</b>{question}</p>)}</div>
    <button className="secondary" disabled={!cloudEnabled || loading} onClick={onEscalate}>
      {loading ? <><span className="spinner dark" /> Requesting second opinion…</> : <>Escalate to {cloudModel.replace(' (simulated demo)', '')} <span>↗</span></>}
      {!cloudEnabled && <small>Cloud endpoint not configured</small>}
    </button>
    {cloud && <div className="cloud-result"><span className="kicker">{simulated ? 'SIMULATED CLOUD COMPARISON' : 'CLOUD SECOND OPINION'}</span><div className={`urgency compact ${cloud.urgency}`}><strong>{cloud.urgency.toUpperCase()}</strong><p>{cloud.urgency_reason}</p></div><p>{cloud.referral_note}</p></div>}
    <div className="result-disclaimer">{r.disclaimer}</div>
  </>;
}

export default App;
