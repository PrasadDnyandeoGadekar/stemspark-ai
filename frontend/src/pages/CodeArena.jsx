import { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  LoaderCircle,
  Play,
  RotateCcw,
  Trash2,
  Terminal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCodeLanguages, executeCode } from "../services/codeArena";
import { useTheme } from "../context/ThemeContext";

const STARTERS = {
  python: "name = input()\nprint(f\"Hello, {name}!\")\n",
  c: '#include <stdio.h>\n\nint main(void) {\n    char name[100];\n    if (scanf("%99s", name) == 1) {\n        printf("Hello, %s!\\n", name);\n    }\n    return 0;\n}\n',
  cpp: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::cin >> name;\n    std::cout << "Hello, " << name << "!\\n";\n    return 0;\n}\n',
  java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "!");\n    }\n}\n',
  other: "// Write your program here\n",
};

const PREFERRED_LANGUAGE_NAMES = [
  /^Python \(3\.12/i,
  /^C \(GCC 14/i,
  /^C\+\+ \(GCC 14/i,
  /^Java \(JDK 17/i,
];

function getFamily(name = "") {
  if (/^python(?:\s|\(|$)/i.test(name)) return "python";
  if (/^c\+\+/i.test(name)) return "cpp";
  if (/^c\s*\(/i.test(name)) return "c";
  if (/^java(?:\s|\(|$)/i.test(name)) return "java";
  return "other";
}

function chooseLanguages(languages) {
  const sorted = [];
  const used = new Set();

  for (const preferredName of PREFERRED_LANGUAGE_NAMES) {
    const language = languages.find(({ name }) => preferredName.test(name));
    if (language) {
      sorted.push(language);
      used.add(language.id);
    }
  }

  for (const language of languages) {
    if (!used.has(language.id)) sorted.push(language);
  }
  return sorted;
}

function getStarterCode(languageName) {
  return STARTERS[getFamily(languageName)] || STARTERS.other;
}

function ConsolePanel({ result, outputError, running, onClear, dark }) {
  const status = result?.status;
  const statusId = status?.id;
  const statusColor = statusId === 3
    ? "text-emerald-500"
    : statusId === 5 || statusId >= 6
      ? "text-rose-500"
      : "text-amber-500";

  return (
    <section className={`flex min-h-0 flex-1 flex-col ${dark ? "bg-[#101827]" : "bg-slate-950"}`} aria-label="Program output">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-white/10 px-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Terminal className="h-4 w-4 text-indigo-300" aria-hidden="true" />
          Output
        </div>
        <div className="flex min-w-0 items-center gap-3">
          {running ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Running
            </span>
          ) : status ? (
            <span className={`truncate text-xs font-bold ${statusColor}`}>{status.description}</span>
          ) : null}
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear output"
            title="Clear output"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="min-h-36 flex-1 overflow-auto p-4 font-mono text-[13px] leading-6 sm:p-5" aria-live="polite" aria-atomic="true">
        {outputError ? (
          <p className="whitespace-pre-wrap break-words text-rose-300">{outputError}</p>
        ) : result ? (
          <div className="space-y-3">
            {result.stdout && <pre className="whitespace-pre-wrap break-words text-emerald-200">{result.stdout}</pre>}
            {result.compileOutput && (
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-rose-300">Compilation output</p>
                <pre className="whitespace-pre-wrap break-words text-rose-200">{result.compileOutput}</pre>
              </div>
            )}
            {result.stderr && (
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-300">Standard error</p>
                <pre className="whitespace-pre-wrap break-words text-amber-100">{result.stderr}</pre>
              </div>
            )}
            {result.message && !result.stdout && !result.compileOutput && !result.stderr && (
              <pre className="whitespace-pre-wrap break-words text-slate-300">{result.message}</pre>
            )}
            {!result.stdout && !result.compileOutput && !result.stderr && !result.message && (
              <p className="text-slate-400">Program finished without producing output.</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-xs text-slate-400">
              {result.time && <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {result.time}s</span>}
              {result.memory != null && <span>{result.memory} KB memory</span>}
            </div>
          </div>
        ) : (
          <div className="flex min-h-28 flex-col items-center justify-center text-center text-slate-500">
            <Terminal className="mb-2 h-5 w-5 opacity-70" aria-hidden="true" />
            <p>Your program output will appear here.</p>
            <p className="text-xs">Press Run when you are ready.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CodeArena() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [languagesError, setLanguagesError] = useState("");
  const [activeLanguageId, setActiveLanguageId] = useState("");
  const [codeByLanguage, setCodeByLanguage] = useState({});
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState(null);
  const [outputError, setOutputError] = useState("");
  const [running, setRunning] = useState(false);
  const [activePanel, setActivePanel] = useState("editor");

  useEffect(() => {
    let cancelled = false;
    getCodeLanguages()
      .then((availableLanguages) => {
        if (cancelled) return;
        const ordered = chooseLanguages(availableLanguages);
        setLanguages(ordered);
        setActiveLanguageId(String(ordered[0]?.id || ""));
        if (ordered.length === 0) setLanguagesError("No languages are available from the execution service.");
      })
      .catch((error) => {
        if (!cancelled) setLanguagesError(error.message);
      })
      .finally(() => {
        if (!cancelled) setLanguagesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const activeLanguage = useMemo(
    () => languages.find(({ id }) => String(id) === activeLanguageId),
    [activeLanguageId, languages],
  );
  const currentCode = activeLanguage
    ? codeByLanguage[activeLanguage.id] ?? getStarterCode(activeLanguage.name)
    : "";
  const extensions = useMemo(() => {
    if (activeLanguage && getFamily(activeLanguage.name) === "python") return [python()];
    if (activeLanguage && ["c", "cpp"].includes(getFamily(activeLanguage.name))) return [cpp()];
    if (activeLanguage && getFamily(activeLanguage.name) === "java") return [java()];
    return [];
  }, [activeLanguage]);

  const changeCode = (value) => {
    if (!activeLanguage) return;
    setCodeByLanguage((existing) => ({ ...existing, [activeLanguage.id]: value }));
  };

  const handleLanguageChange = (event) => {
    setActiveLanguageId(event.target.value);
    setResult(null);
    setOutputError("");
  };

  const handleClear = () => {
    changeCode("");
    setResult(null);
    setOutputError("");
  };

  const handleReset = () => {
    if (!activeLanguage) return;
    changeCode(getStarterCode(activeLanguage.name));
    setStdin("");
    setResult(null);
    setOutputError("");
  };

  const handleRun = async () => {
    if (!activeLanguage || running) return;
    setRunning(true);
    setOutputError("");
    setResult(null);
    setActivePanel("output");
    try {
      const execution = await executeCode({
        sourceCode: currentCode,
        languageId: activeLanguage.id,
        stdin,
      });
      setResult(execution);
    } catch (error) {
      setOutputError(error.message);
    } finally {
      setRunning(false);
    }
  };

  const languageOptions = useMemo(() => {
    const primary = languages.filter((language) => getFamily(language.name) !== "other");
    const other = languages.filter((language) => getFamily(language.name) === "other");
    return { primary, other };
  }, [languages]);

  const editorPanel = (
    <section className={`flex min-h-[380px] flex-1 flex-col overflow-hidden ${dark ? "bg-[#101827]" : "bg-[#0f172a]"}`} aria-label="Code editor">
      <div className="flex min-h-12 items-center justify-between gap-2 border-b border-white/10 px-3 sm:px-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Code2 className="h-4 w-4 text-indigo-300" aria-hidden="true" />
          <span>main</span>
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-400">
            {activeLanguage?.name?.split("(")[0]?.trim() || "Code"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!activeLanguage}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
          </button>
        </div>
      </div>
      {languagesError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-slate-300">
          <AlertTriangle className="h-8 w-8 text-amber-400" aria-hidden="true" />
          <p className="max-w-lg text-sm leading-6">{languagesError}</p>
        </div>
      ) : (
        <div className="min-h-[340px] flex-1 text-sm">
          <CodeMirror
            value={currentCode}
            onChange={changeCode}
            extensions={extensions}
            theme="dark"
            height="100%"
            minHeight="340px"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
              bracketMatching: true,
              autocompletion: true,
              tabSize: 4,
            }}
            aria-label="Source code"
            placeholder={languagesLoading ? "Loading Code Arena..." : "Write your program here"}
          />
        </div>
      )}
      <div className="flex min-h-9 items-center justify-between border-t border-white/10 px-4 text-[11px] text-slate-400">
        <span>{activeLanguage?.name || (languagesLoading ? "Loading languages..." : "Language unavailable")}</span>
        <span>UTF-8 · 4 spaces</span>
      </div>
    </section>
  );

  const inputPanel = (
    <section className={`flex min-h-0 flex-1 flex-col ${dark ? "bg-[#101827]" : "bg-slate-950"}`} aria-label="Standard input">
      <div className="flex min-h-12 items-center justify-between gap-2 border-b border-white/10 px-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Terminal className="h-4 w-4 text-indigo-300" aria-hidden="true" />
          Input (stdin)
        </div>
        <span className="text-[11px] text-slate-500">One value per line</span>
      </div>
      <textarea
        value={stdin}
        onChange={(event) => setStdin(event.target.value)}
        aria-label="Standard input for your program"
        placeholder={"Example:\nAda"}
        spellCheck="false"
        className="min-h-28 flex-1 resize-y bg-transparent p-4 font-mono text-[13px] leading-6 text-slate-200 outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:resize-none"
      />
    </section>
  );

  const consolePanel = (
    <ConsolePanel
      result={result}
      outputError={outputError}
      running={running}
      onClear={() => { setResult(null); setOutputError(""); }}
      dark={dark}
    />
  );

  return (
    <div className={`code-arena-page min-h-screen flex-1 ${dark ? "bg-[#0b1020] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <div className="mx-auto max-w-[1500px] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/" className={`inline-flex items-center gap-1.5 text-xs font-bold transition hover:text-indigo-500 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              <ChevronDown className="h-3.5 w-3.5 rotate-90" aria-hidden="true" /> STEMSpark home
            </Link>
            <div className="mt-3 flex items-center gap-3">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${dark ? "bg-indigo-400/15 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                <Code2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Code Arena</h1>
                <p className={`mt-0.5 text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}>Write, run and learn — all in one place.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <label className="relative min-w-0 flex-1 sm:flex-none">
              <span className="sr-only">Programming language</span>
              <select
                value={activeLanguageId}
                onChange={handleLanguageChange}
                disabled={languagesLoading || languages.length === 0}
                className={`h-11 w-full min-w-0 appearance-none rounded-xl border py-2 pl-3 pr-10 text-sm font-bold shadow-sm outline-none transition focus:ring-4 focus:ring-indigo-200 disabled:opacity-60 sm:min-w-56 ${
                  dark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-800"
                }`}
              >
                {languageOptions.primary.length > 0 && (
                  <optgroup label="Popular languages">
                    {languageOptions.primary.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
                  </optgroup>
                )}
                {languageOptions.other.length > 0 && (
                  <optgroup label="More Judge0 languages">
                    {languageOptions.other.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            </label>
            <button
              type="button"
              onClick={handleRun}
              disabled={!activeLanguage || running || languagesLoading}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-extrabold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none"
            >
              {running ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4 fill-current" aria-hidden="true" />}
              {running ? "Running..." : "Run code"}
            </button>
          </div>
        </div>

        <div className={`overflow-hidden rounded-2xl border shadow-xl ${dark ? "border-slate-800 bg-[#101827] shadow-black/20" : "border-slate-200 bg-white shadow-slate-900/5"}`}>
          <div className={`flex min-h-11 items-center justify-between border-b px-4 ${dark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className={`ml-2 text-xs font-bold ${dark ? "text-slate-400" : "text-slate-500"}`}>STEMSpark · Code workspace</span>
            </div>
            {result?.status?.id === 3 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                <Check className="h-3.5 w-3.5" aria-hidden="true" /> Finished
              </span>
            )}
          </div>

          <div className="grid min-h-[520px] lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
            <div className="hidden min-w-0 lg:flex">{editorPanel}</div>
            <div className="hidden min-h-[520px] min-w-0 flex-col divide-y divide-white/10 lg:flex">
              {inputPanel}
              {consolePanel}
            </div>

            <div className="lg:hidden">
              <div className={`flex gap-1 border-b p-2 ${dark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-slate-50"}`} role="tablist" aria-label="Code workspace panels">
                {[
                  { id: "editor", label: "Editor", icon: Code2 },
                  { id: "input", label: "Input", icon: Terminal },
                  { id: "output", label: "Output", icon: CircleHelp },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={activePanel === id}
                    onClick={() => setActivePanel(id)}
                    className={`inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition ${
                      activePanel === id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : dark ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                    {id === "output" && result?.status?.id === 3 && <Check className="h-3.5 w-3.5" aria-label="Success" />}
                  </button>
                ))}
              </div>
              {activePanel === "editor" && editorPanel}
              {activePanel === "input" && <div className="flex min-h-[380px]">{inputPanel}</div>}
              {activePanel === "output" && <div className="flex min-h-[380px]">{consolePanel}</div>}
            </div>
          </div>
        </div>

        <div className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 sm:p-4 ${dark ? "border-indigo-400/20 bg-indigo-400/5 text-slate-400" : "border-indigo-100 bg-indigo-50/70 text-slate-600"}`}>
          <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
          <p>Your program runs in Judge0’s isolated sandbox with CPU, memory and execution-time limits. Use stdin for input; errors and program output appear in the console.</p>
        </div>
      </div>
    </div>
  );
}

export default CodeArena;
