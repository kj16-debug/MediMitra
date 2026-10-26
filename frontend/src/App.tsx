import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { AnalyzeRequest, DemoPatient, Status, TriageResult, Vitals } from './types';
import { Header, type Screen } from './components/Header';
import { Footer } from './components/Footer';
import { RulesBanner } from './components/RulesBanner';
import { HomeScreen } from './screens/HomeScreen';
import { IntakeScreen } from './screens/IntakeScreen';

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
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
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
      const res = await api.analyze(form);
      setResult(res);
      const isSelfHarm =
        res.rule_reasons.some((r) => r.toLowerCase().includes('self-harm') || r.toLowerCase().includes('human support')) ||
        res.red_flags.some((f) => f.toLowerCase().includes('self-harm'));
      if (isSelfHarm) {
        setCurrentScreen('self_harm');
      } else {
        setCurrentScreen('summary');
      }
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
      const cloudRes = await api.escalate(form, result);
      setCloud(cloudRes);
      setCurrentScreen('comparison');
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
  const isSelfHarm = Boolean(
    result?.rule_reasons.some((r) => r.toLowerCase().includes('self-harm') || r.toLowerCase().includes('human support')) ||
    result?.red_flags.some((f) => f.toLowerCase().includes('self-harm'))
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-body-lg text-on-surface">
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        isOnline={browserOnline}
        hasResult={Boolean(result)}
        hasCloud={Boolean(cloud)}
        isSelfHarm={isSelfHarm}
      />

      <main className="w-full pt-20 md:pt-24 flex-1">
        <div className="max-w-[1100px] mx-auto px-margin min-h-[calc(100vh-10rem)]">
          <RulesBanner show={Boolean(result?.rules_only)} />

          {currentScreen === 'home' && (
            <HomeScreen
              onStartNewCase={() => setCurrentScreen('intake')}
              onLoadDemo={(name) => {
                loadDemo(name);
                setCurrentScreen('intake');
              }}
              onViewReferrals={() => {
                if (result) setCurrentScreen('referral');
                else setCurrentScreen('intake');
              }}
              demos={demos}
              isOnline={browserOnline}
            />
          )}

          {currentScreen === 'intake' && (
            <IntakeScreen
              form={form}
              set={set}
              setVital={setVital}
              onAnalyze={analyze}
              busy={busy}
              error={error}
              demos={demos}
              selectedDemo={selected}
              onLoadDemo={loadDemo}
              onBackToHome={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen !== 'home' && currentScreen !== 'intake' && (
            <div className="space-y-space-md">
              {result && (
                <section className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container">
                  <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-surface-container">
                    <span className="font-bold text-primary">Triage Result</span>
                    <button
                      onClick={() => setCurrentScreen('referral')}
                      className="px-3 py-1 bg-primary text-on-primary rounded text-xs font-bold cursor-pointer"
                    >
                      View Referral Note →
                    </button>
                  </div>
                  <div className={`p-4 rounded-xl mb-4 ${result.urgency === 'red' ? 'bg-error-container text-on-error-container' : result.urgency === 'yellow' ? 'bg-amber-500/15 text-amber-900' : 'bg-surface-container'}`}>
                    <div className="font-black text-lg uppercase tracking-wide">
                      {result.urgency === 'yellow' ? 'YELLOW - REFER SOON' : `${result.urgency.toUpperCase()} - ${result.urgency === 'red' ? 'REFER NOW' : 'ROUTINE'}`}
                    </div>
                    <p className="mt-1 font-medium">{result.urgency_reason}</p>
                  </div>
                  <p className="text-sm text-on-surface-variant">{result.summary_plain}</p>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
