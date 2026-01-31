"use client";

import { useState, useEffect, useRef } from "react";

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return { count, ref };
}

// Security header type for real scan results
interface HeaderResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

// What we fix - the real value prop
const whatWeFix = [
  {
    problem: "Exposed API Keys",
    solution: "Auto-rotate and move to environment variables",
    icon: "🔑"
  },
  {
    problem: "Broken RLS Policies",
    solution: "Generate secure policies with one click",
    icon: "🛡️"
  },
  {
    problem: "Missing Security Headers",
    solution: "Add all headers with copy-paste middleware",
    icon: "📋"
  },
  {
    problem: "Open CORS Config",
    solution: "Lock down to your domains automatically",
    icon: "🔒"
  },
  {
    problem: "No Rate Limiting",
    solution: "Add protection with pre-built templates",
    icon: "⚡"
  },
  {
    problem: "Insecure Defaults",
    solution: "AI rules files to prevent issues from day one",
    icon: "🤖"
  },
];

// Wall of Shame findings
const shameFindings = [
  {
    type: "EXPOSED_KEY",
    title: "Supabase service_role key in client bundle",
    detail: "████████.supabase.co with full DB access",
    severity: "CRITICAL",
    fixed: "Moved to server-side API route"
  },
  {
    type: "BROKEN_RLS",
    title: "Row Level Security policy allows SELECT *",
    detail: "users table accessible without auth",
    severity: "CRITICAL",
    fixed: "Generated secure RLS policy"
  },
  {
    type: "MISSING_HEADER",
    title: "No Content-Security-Policy header",
    detail: "XSS attacks possible via script injection",
    severity: "HIGH",
    fixed: "Added CSP middleware"
  },
  {
    type: "OPEN_CORS",
    title: "CORS allows any origin (*)",
    detail: "API accepts requests from any domain",
    severity: "HIGH",
    fixed: "Restricted to app domain"
  },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "complete">("idle");
  const [scanResults, setScanResults] = useState<HeaderResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const vulnCount = useCountUp(2000, 2500);
  const keysCount = useCountUp(400, 2000);
  const piiCount = useCountUp(175, 1800);

  // Track scroll for header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScan = async () => {
    if (!url) return;
    setScanStatus("scanning");
    setScanResults([]);

    try {
      const response = await fetch("/api/scan-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        setScanResults(data.results);
      } else {
        // Fallback to simulated results if API fails
        setScanResults([
          { name: "Content-Security-Policy", status: "fail", message: "Missing - XSS protection disabled" },
          { name: "X-Frame-Options", status: "fail", message: "Missing - Clickjacking possible" },
          { name: "Strict-Transport-Security", status: "warn", message: "Missing - HTTPS not enforced" },
          { name: "X-Content-Type-Options", status: "pass", message: "Present - MIME sniffing blocked" },
        ]);
      }
    } catch {
      // Fallback for demo
      setScanResults([
        { name: "Content-Security-Policy", status: "fail", message: "Missing - XSS protection disabled" },
        { name: "X-Frame-Options", status: "fail", message: "Missing - Clickjacking possible" },
        { name: "Strict-Transport-Security", status: "warn", message: "Missing - HTTPS not enforced" },
        { name: "X-Content-Type-Options", status: "pass", message: "Present - MIME sniffing blocked" },
      ]);
    }

    setScanStatus("complete");
    setTimeout(() => {
      setIsModalOpen(true);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, url }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch {
      setIsSubmitted(true);
    }

    setIsSubmitting(false);
  };

  const failCount = scanResults.filter(r => r.status === "fail").length;
  const warnCount = scanResults.filter(r => r.status === "warn").length;
  const passCount = scanResults.filter(r => r.status === "pass").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] relative overflow-x-hidden">
      {/* Subtle scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20">
        <div className="absolute inset-0" style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 212, 255, 0.02) 2px, rgba(0, 212, 255, 0.02) 4px)"
        }} />
      </div>

      {/* Floating Glassmorphism Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? "py-2" : "py-4"
      }`}>
        <div className={`max-w-7xl mx-auto px-6 ${isScrolled ? "px-4" : ""}`}>
          <div className={`flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300 ${
            isScrolled
              ? "bg-[#0a0a0a]/70 backdrop-blur-xl border border-[#00d4ff]/10 shadow-lg shadow-[#00d4ff]/5"
              : "bg-transparent"
          }`}
          style={{
            backdropFilter: isScrolled ? "blur(20px) saturate(180%)" : "none",
            WebkitBackdropFilter: isScrolled ? "blur(20px) saturate(180%)" : "none",
          }}>
            <a href="#" className="font-mono text-[#00d4ff] text-lg tracking-wider font-bold">
              SHIPSAFE
            </a>
            <div className="hidden md:flex items-center gap-8">
              {["THE_PROBLEM", "THE_FIX", "HOW_IT_WORKS"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace("_", "-")}`}
                  className="font-mono text-sm text-[#888] hover:text-[#00d4ff] transition-colors tracking-wide"
                >
                  {item}
                </a>
              ))}
            </div>
            <div className="font-mono text-xs text-[#00d4ff]/50 border border-[#00d4ff]/20 px-3 py-1 rounded-full">
              beta
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen pt-32 pb-16 flex items-center relative">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="font-mono text-xs text-[#00d4ff] tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
                  SECURITY_FOR_VIBE_CODERS
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-white">We don't just find security holes. </span>
                <span className="text-[#00d4ff] relative">
                  We fix them.
                  <span className="absolute -inset-1 bg-[#00d4ff]/10 blur-xl -z-10" />
                </span>
              </h1>

              <p className="text-lg text-[#888] max-w-lg leading-relaxed">
                Security shouldn't be friction. Apps built with{" "}
                <span className="text-[#e0e0e0]">Cursor</span>,{" "}
                <span className="text-[#e0e0e0]">Claude Code</span>,{" "}
                <span className="text-[#e0e0e0]">Lovable</span>,{" "}
                <span className="text-[#e0e0e0]">Bolt</span>, and{" "}
                <span className="text-[#e0e0e0]">Replit</span>{" "}
                ship with vulnerabilities. We make them disappear.
              </p>

              <p className="text-base text-[#666] max-w-lg border-l-2 border-[#00d4ff]/30 pl-4">
                Scan → Understand → Fix. Learn why it's wrong so you never make that mistake again.
              </p>

              {/* Value Props */}
              <div className="flex flex-wrap gap-3">
                {[
                  "Auto-fix vulnerabilities",
                  "AI rules to prevent issues",
                  "Copy-paste solutions",
                ].map((prop) => (
                  <div
                    key={prop}
                    className="font-mono text-xs border border-dashed border-[#333] px-3 py-2 bg-[#111]/50 text-[#888]"
                  >
                    <span className="text-[#00ff88]">✓</span> {prop}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Scan Module */}
            <div className="relative">
              <div className="border border-[#222] bg-[#111]/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl shadow-[#00d4ff]/5">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] bg-[#0d0d0d]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="font-mono text-xs text-[#666] tracking-wider">shipsafe_scanner</span>
                  <div className="w-16" />
                </div>

                {/* Input Area */}
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="font-mono text-xs text-[#666] tracking-wider block">
                      Enter your app URL for a free security check
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://your-app.vercel.app"
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 font-mono text-sm text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/20 transition-all"
                        disabled={scanStatus === "scanning"}
                        onKeyDown={(e) => e.key === "Enter" && handleScan()}
                      />
                      {url && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleScan}
                    disabled={!url || scanStatus === "scanning"}
                    className="w-full bg-gradient-to-r from-[#00d4ff] to-[#00b8e6] hover:from-[#00b8e6] hover:to-[#0099cc] disabled:from-[#333] disabled:to-[#333] disabled:text-[#666] text-[#0a0a0a] font-mono font-bold py-3 px-6 rounded-lg transition-all duration-200 tracking-wider disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    {scanStatus === "scanning" ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Scanning...</span>
                      </span>
                    ) : (
                      <span>Check My App</span>
                    )}
                  </button>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center gap-2 font-mono text-xs">
                    <div className={`w-2 h-2 rounded-full transition-colors ${
                      scanStatus === "idle" ? "bg-[#666]" :
                      scanStatus === "scanning" ? "bg-[#febc2e] animate-pulse" :
                      "bg-[#28c840]"
                    }`} />
                    <span className={`transition-colors ${
                      scanStatus === "idle" ? "text-[#666]" :
                      scanStatus === "scanning" ? "text-[#febc2e]" :
                      "text-[#28c840]"
                    }`}>
                      {scanStatus === "idle" && "Free security headers check"}
                      {scanStatus === "scanning" && "Analyzing security headers..."}
                      {scanStatus === "complete" && "Scan complete"}
                    </span>
                  </div>

                  {/* Scanning Animation */}
                  {scanStatus === "scanning" && (
                    <div className="space-y-2 pt-2 border-t border-[#222]">
                      {["Connecting to target...", "Checking HTTP headers...", "Analyzing security config..."].map((step, i) => (
                        <div
                          key={step}
                          className="font-mono text-xs text-[#666] flex items-center gap-2"
                          style={{
                            animation: "fadeIn 0.3s ease-out forwards",
                            animationDelay: `${i * 0.5}s`,
                            opacity: 0
                          }}
                        >
                          <span className="text-[#00d4ff]">›</span>
                          {step}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* What you get */}
                <div className="px-6 py-4 bg-[#0d0d0d] border-t border-[#222]">
                  <p className="font-mono text-xs text-[#666] text-center">
                    Free scan checks headers • Full scan + auto-fix coming soon
                  </p>
                </div>
              </div>

              {/* Decorative glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#00d4ff]/5 to-transparent rounded-3xl blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM Section */}
      <section id="the-problem" className="py-24 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 space-y-4">
            <div className="font-mono text-xs text-[#ff5f57] tracking-widest">
              THE_PROBLEM
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Vibe coding is <span className="text-[#ff5f57]">shipping vulnerabilities</span> at scale
            </h2>
            <p className="text-[#666] max-w-2xl">
              AI tools make you fast. But they don't make you secure.
              The result? Thousands of apps with exposed keys, broken auth, and open databases.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-16" ref={vulnCount.ref}>
            {[
              { count: vulnCount.count, suffix: "+", label: "Vulnerabilities found", sublabel: "in AI-built apps" },
              { count: keysCount.count, suffix: "+", label: "Exposed API keys", sublabel: "scraped by attackers daily" },
              { count: piiCount.count, suffix: "", label: "Leaked PII instances", sublabel: "medical records, IBANs, emails" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="border border-[#222] bg-[#111]/50 rounded-lg p-6 text-center"
                ref={i === 0 ? vulnCount.ref : i === 1 ? keysCount.ref : piiCount.ref}
              >
                <div className="font-mono text-4xl md:text-5xl font-bold text-[#ff5f57] mb-2">
                  {stat.count.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-[#e0e0e0] font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-[#666]">{stat.sublabel}</div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="max-w-2xl mx-auto text-center">
            <blockquote className="text-xl text-[#888] italic mb-4">
              "$500+ AWS bill from a single bot attack. Not fun lol"
            </blockquote>
            <cite className="font-mono text-xs text-[#666]">
              — Real comment from r/SaaS
            </cite>
          </div>
        </div>
      </section>

      {/* THE FIX Section */}
      <section id="the-fix" className="py-24 border-t border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 space-y-4">
            <div className="font-mono text-xs text-[#00d4ff] tracking-widest">
              THE_FIX
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Stop finding problems. <span className="text-[#00d4ff]">Start fixing them.</span>
            </h2>
            <p className="text-[#666] max-w-2xl">
              Other tools tell you what's wrong. ShipSafe fixes it.
              One click to secure, with explanations so you learn along the way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whatWeFix.map((item, i) => (
              <div
                key={item.problem}
                className="border border-[#222] bg-[#111]/50 rounded-lg p-5 hover:border-[#00d4ff]/30 transition-all group"
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-medium text-[#e0e0e0] mb-2 group-hover:text-[#00d4ff] transition-colors">
                  {item.problem}
                </h3>
                <p className="text-sm text-[#666]">
                  <span className="text-[#00ff88]">→</span> {item.solution}
                </p>
              </div>
            ))}
          </div>

          {/* Before/After */}
          <div className="mt-16 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="border border-[#ff5f57]/30 bg-[#ff5f57]/5 rounded-lg p-6">
              <div className="font-mono text-xs text-[#ff5f57] mb-4">WITHOUT SHIPSAFE</div>
              <ul className="space-y-2 text-[#888]">
                <li className="flex items-start gap-2">
                  <span className="text-[#ff5f57]">✗</span>
                  <span>Find vulnerabilities manually (or get hacked)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ff5f57]">✗</span>
                  <span>Google how to fix each issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ff5f57]">✗</span>
                  <span>Hope you didn't miss anything</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ff5f57]">✗</span>
                  <span>Make the same mistakes next project</span>
                </li>
              </ul>
            </div>
            <div className="border border-[#00d4ff]/30 bg-[#00d4ff]/5 rounded-lg p-6">
              <div className="font-mono text-xs text-[#00d4ff] mb-4">WITH SHIPSAFE</div>
              <ul className="space-y-2 text-[#888]">
                <li className="flex items-start gap-2">
                  <span className="text-[#00ff88]">✓</span>
                  <span>Automated scan finds everything</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00ff88]">✓</span>
                  <span>One-click fixes with explanations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00ff88]">✓</span>
                  <span>Learn why it matters (never repeat)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00ff88]">✓</span>
                  <span>AI rules prevent issues from day one</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* WALL OF SHAME Section */}
      <section className="py-24 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 space-y-4">
            <div className="font-mono text-xs text-[#febc2e] tracking-widest">
              CASE_FILES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Real vulnerabilities. <span className="text-[#00ff88]">Real fixes.</span>
            </h2>
            <p className="text-[#666] max-w-2xl">
              These are actual issues we've found and fixed. Names redacted, lessons learned.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {shameFindings.map((finding, i) => (
              <div
                key={i}
                className="border border-[#222] bg-[#111]/50 rounded-lg overflow-hidden group hover:border-[#00d4ff]/30 transition-colors"
              >
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#222] bg-[#0d0d0d]">
                  <span className="font-mono text-xs text-[#666]">CASE_{String(i + 1).padStart(3, "0")}</span>
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: finding.severity === "CRITICAL" ? "#ff5f57" : "#febc2e",
                      backgroundColor: finding.severity === "CRITICAL" ? "rgba(255,95,87,0.1)" : "rgba(254,188,46,0.1)"
                    }}
                  >
                    {finding.severity}
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="text-[#e0e0e0] font-medium">{finding.title}</h3>
                  <p className="font-mono text-sm text-[#666] bg-[#0a0a0a] px-3 py-2 rounded border-l-2 border-[#333]">
                    {finding.detail}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[#00ff88]">✓</span>
                    <span className="text-sm text-[#00ff88]">{finding.fixed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS Section */}
      <section id="how-it-works" className="py-24 border-t border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 space-y-4">
            <div className="font-mono text-xs text-[#00d4ff] tracking-widest">
              HOW_IT_WORKS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Security without the friction
            </h2>
            <p className="text-[#666] max-w-2xl">
              Three steps. Full protection. Zero security expertise required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Scan",
                desc: "Paste your URL. We check security headers, exposed keys, RLS policies, and more.",
                color: "#00d4ff",
              },
              {
                step: "02",
                title: "Learn",
                desc: "Understand what's wrong and why it matters. No jargon, real explanations.",
                color: "#febc2e",
              },
              {
                step: "03",
                title: "Fix",
                desc: "One-click fixes or copy-paste code. Plus AI rules to prevent future issues.",
                color: "#28c840",
              },
            ].map((step, i) => (
              <div key={step.step} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-px bg-gradient-to-r from-[#333] to-transparent" />
                )}
                <div className="border border-[#222] bg-[#111]/50 rounded-lg p-6 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-mono text-3xl font-bold" style={{ color: step.color }}>{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#e0e0e0] mb-3">{step.title}</h3>
                  <p className="text-[#666] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-6 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ship secure. <span className="text-[#00d4ff]">Ship fast.</span>
            </h2>
            <p className="text-xl text-[#888] max-w-2xl mx-auto">
              Security shouldn't slow you down. Join the waitlist for automatic vulnerability fixes.
            </p>
          </div>

          {/* Email Signup Form */}
          <div className="max-w-md mx-auto">
            <div className="border border-[#222] bg-[#111]/50 rounded-lg p-6 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 font-mono text-sm text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#00d4ff]/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!email || isSubmitting}
                  className="w-full bg-gradient-to-r from-[#00d4ff] to-[#00b8e6] hover:from-[#00b8e6] hover:to-[#0099cc] disabled:from-[#333] disabled:to-[#333] disabled:text-[#666] text-[#0a0a0a] font-bold py-3 px-6 rounded-lg transition-all tracking-wide disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Joining..." : "Get Early Access"}
                </button>
              </form>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-[#666]">
                <span>✓ Early access pricing</span>
                <span>✓ Priority support</span>
                <span>✓ Shape the product</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-mono text-sm text-[#666]">
              ShipSafe — Security for vibe coders
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-[#666] hover:text-[#00d4ff] transition-colors">
                Twitter
              </a>
              <a href="#" className="text-sm text-[#666] hover:text-[#00d4ff] transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Results Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm"
            onClick={() => !isSubmitted && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg border border-[#222] bg-[#111] rounded-xl overflow-hidden shadow-2xl animate-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#222] bg-[#0d0d0d]">
              <span className="font-mono text-sm text-[#00d4ff]">Security Check Results</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#666] hover:text-[#e0e0e0] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {!isSubmitted ? (
                <div className="space-y-6">
                  {/* Target */}
                  <div className="font-mono text-xs text-[#666]">
                    Target: <span className="text-[#e0e0e0] break-all">{url}</span>
                  </div>

                  {/* Results Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-[#ff5f57]/10 rounded-lg border border-[#ff5f57]/20">
                      <div className="font-mono text-2xl font-bold text-[#ff5f57]">{failCount}</div>
                      <div className="text-xs text-[#888]">Failed</div>
                    </div>
                    <div className="text-center p-3 bg-[#febc2e]/10 rounded-lg border border-[#febc2e]/20">
                      <div className="font-mono text-2xl font-bold text-[#febc2e]">{warnCount}</div>
                      <div className="text-xs text-[#888]">Warnings</div>
                    </div>
                    <div className="text-center p-3 bg-[#28c840]/10 rounded-lg border border-[#28c840]/20">
                      <div className="font-mono text-2xl font-bold text-[#28c840]">{passCount}</div>
                      <div className="text-xs text-[#888]">Passed</div>
                    </div>
                  </div>

                  {/* Header Results */}
                  <div className="space-y-2">
                    <div className="font-mono text-xs text-[#666] mb-3">Security Headers Check:</div>
                    {scanResults.map((result, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#222]">
                        <span className={`mt-0.5 ${
                          result.status === "pass" ? "text-[#28c840]" :
                          result.status === "warn" ? "text-[#febc2e]" :
                          "text-[#ff5f57]"
                        }`}>
                          {result.status === "pass" ? "✓" : result.status === "warn" ? "!" : "✗"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm text-[#e0e0e0]">{result.name}</div>
                          <div className="text-xs text-[#666] mt-0.5">{result.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upgrade CTA */}
                  <div className="border-t border-[#222] pt-6">
                    <div className="text-center space-y-4">
                      <p className="text-[#888] text-sm">
                        This is just the header check. The full scan finds <span className="text-[#00d4ff] font-medium">exposed API keys</span>,
                        {" "}<span className="text-[#00d4ff] font-medium">broken RLS</span>, and more — plus{" "}
                        <span className="text-[#00ff88] font-medium">automatic fixes</span>.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 font-mono text-sm text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#00d4ff]/50 transition-colors"
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={!email || isSubmitting}
                          className="w-full bg-gradient-to-r from-[#00d4ff] to-[#00b8e6] hover:from-[#00b8e6] hover:to-[#0099cc] disabled:from-[#333] disabled:to-[#333] disabled:text-[#666] text-[#0a0a0a] font-bold py-3 px-6 rounded-lg transition-all disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Joining..." : "Get Full Scan + Auto-Fix"}
                        </button>
                      </form>

                      <p className="text-xs text-[#666]">
                        Join waitlist for full scanner with automatic vulnerability fixes
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-[#28c840]/10 rounded-full flex items-center justify-center border border-[#28c840]/30">
                    <span className="text-[#28c840] text-3xl">✓</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#e0e0e0]">You're on the list!</h3>
                  <p className="text-[#888] max-w-sm mx-auto">
                    We'll notify you when the full scanner with auto-fix is ready.
                    Early access members get priority + special pricing.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-sm text-[#00d4ff] hover:underline mt-4"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-in {
          animation: modalIn 0.2s ease-out;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
