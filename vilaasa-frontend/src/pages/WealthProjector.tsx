import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useCurrency } from "@/contexts/CurrencyContext";
import vilaasaLogo from "@/assets/vilaasa-logo.svg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fallbackExchangeRates = {
  INR: 1,
  USD: 0.012,
  AED: 0.044,
} as const;

const currencySymbols = {
  INR: "\u20B9",
  USD: "$", 
  AED: "\u062F.\u0625",
} as const;

const regionYields: Record<
  string,
  { label: string; defaultYield: number; fdRate: number }
> = {
  india: { label: "India", defaultYield: 6, fdRate: 6 },
  uae: { label: "UAE", defaultYield: 8, fdRate: 3 },
  uk: { label: "UK", defaultYield: 4, fdRate: 4 },
  usa: { label: "USA", defaultYield: 5, fdRate: 4.5 },
  singapore: { label: "Singapore", defaultYield: 3, fdRate: 3 },
  australia: { label: "Australia", defaultYield: 4, fdRate: 4 },
  franchise: { label: "Franchise (India)", defaultYield: 21, fdRate: 6 },
};

const durationOptions = [
  { value: 3, label: "3 Years" },
  { value: 5, label: "5 Years" },
  { value: 10, label: "10 Years" },
];

const performanceOptions = [
  { value: 0.5, label: "Conservative", percentage: "50%" },
  { value: 0.75, label: "Moderate", percentage: "75%" },
  { value: 1.0, label: "Aggressive", percentage: "100%" },
];

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const dataUrlToUint8Array = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const buildPdfFromJpeg = (
  jpegBytes: Uint8Array,
  imageWidth: number,
  imageHeight: number,
) => {
  const encoder = new TextEncoder();
  const pageWidth = 595;
  const pageHeight = 842;
  const contentStream = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;

  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let length = 0;

  const pushString = (value: string) => {
    const bytes = encoder.encode(value);
    chunks.push(bytes);
    length += bytes.length;
  };

  pushString("%PDF-1.4\n");
  offsets.push(length);
  pushString("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  offsets.push(length);
  pushString("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  offsets.push(length);
  pushString(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
  );
  offsets.push(length);
  pushString(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
  );
  chunks.push(jpegBytes);
  length += jpegBytes.length;
  pushString("\nendstream\nendobj\n");
  offsets.push(length);
  pushString(
    `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`,
  );

  const xrefStart = length;
  pushString(`xref\n0 ${offsets.length}\n`);
  pushString("0000000000 65535 f \n");
  for (let i = 1; i < offsets.length; i += 1) {
    pushString(`${offsets[i].toString().padStart(10, "0")} 00000 n \n`);
  }
  pushString(
    `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`,
  );

  const merged = new Uint8Array(length);
  let cursor = 0;
  chunks.forEach((chunk) => {
    merged.set(chunk, cursor);
    cursor += chunk.length;
  });
  return merged;
};

const AnimatedNumber = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = (value - displayValue) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue((prev) => prev + increment);
      }
    }, stepDuration);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatNumber = (num: number) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(decimals)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(decimals)} L`;
    return num.toLocaleString("en-IN", { maximumFractionDigits: decimals });
  };

  return (
    <span className="font-mono tabular-nums">
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
};

const WealthProjector = () => {
  const { currency, setCurrency, exchangeRates } = useCurrency();
  const [region, setRegion] = useState("india");
  const [customYield, setCustomYield] = useState(regionYields.india.defaultYield);
  const [investmentAmount, setInvestmentAmount] = useState(10000000);
  const [duration, setDuration] = useState(5);
  const [performance, setPerformance] = useState(0.75);
  const capitalAppreciation = 5;

  useEffect(() => {
    setCustomYield(regionYields[region].defaultYield);
  }, [region]);

  const getFxRate = (curr: "INR" | "USD" | "AED") => {
    const live = exchangeRates[curr];
    if (typeof live === "number" && live > 0) return live;
    return fallbackExchangeRates[curr];
  };

  const getInvestmentRange = () => {
    const minINR = 4500000;
    const maxINR = 200000000;
    const rate = getFxRate(currency);
    return {
      min: Math.round(minINR * rate),
      max: Math.round(maxINR * rate),
    };
  };

  const range = getInvestmentRange();
  const effectiveYield = customYield * performance;
  const annualReturn = investmentAmount * (effectiveYield / 100);
  const monthlyPayout = annualReturn / 12;
  const totalRentalIncome = annualReturn * duration;
  const futureAssetValue =
    investmentAmount * Math.pow(1 + capitalAppreciation / 100, duration);
  const capitalGain = futureAssetValue - investmentAmount;
  const totalROI = totalRentalIncome + capitalGain;

  const fdRate = regionYields[region].fdRate;
  const fdReturn =
    investmentAmount * Math.pow(1 + fdRate / 100, duration) - investmentAmount;
  const additionalGain = totalROI - fdReturn;

  const comparisonData = [
    { name: "Vilaasa Estate", value: totalROI, fill: "hsl(var(--gold))" },
    { name: "Traditional FD", value: fdReturn, fill: "hsl(var(--muted-foreground))" },
  ];

  const formatCurrency = (value: number) => {
    const symbol = currencySymbols[currency];
    if (value >= 10000000) return `${symbol}${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `${symbol}${(value / 100000).toFixed(2)} L`;
    return `${symbol}${value.toLocaleString("en-IN")}`;
  };

  const formatCurrencyForPdf = (value: number) => {
    if (value >= 10000000) return `${currency} ${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `${currency} ${(value / 100000).toFixed(2)} L`;
    return `${currency} ${value.toLocaleString("en-IN")}`;
  };

  const downloadReportPdf = async () => {
    const reportDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    const lines = [
      "Vilaasa Estate - Wealth Projection Report",
      "-----------------------------------------",
      `Generated On: ${reportDate}`,
      "",
      "Inputs",
      `FX Source: Live API (INR base)`,
      `INR->USD: ${getFxRate("USD").toFixed(4)} | INR->AED: ${getFxRate("AED").toFixed(4)}`,
      `Currency: ${currency}`,
      `Region: ${regionYields[region].label}`,
      `Investment Amount: ${formatCurrencyForPdf(investmentAmount)}`,
      `Duration: ${duration} Years`,
      `Performance Profile: ${
        performanceOptions.find((p) => p.value === performance)?.label ?? "Custom"
      } (${Math.round(performance * 100)}%)`,
      `Expected Annual Yield: ${customYield.toFixed(1)}%`,
      `Effective Yield: ${effectiveYield.toFixed(1)}%`,
      "",
      "Projected Outputs",
      `Monthly Payout: ${formatCurrencyForPdf(monthlyPayout)}`,
      `Total Payout (${duration}Y): ${formatCurrencyForPdf(totalRentalIncome)}`,
      `Projected Asset Value: ${formatCurrencyForPdf(futureAssetValue)}`,
      `Capital Gain: ${formatCurrencyForPdf(capitalGain)}`,
      `Total ROI: ${formatCurrencyForPdf(totalROI)}`,
      "",
      "Benchmark Comparison",
      `Traditional FD Rate: ${fdRate.toFixed(1)}%`,
      `Traditional FD Return: ${formatCurrencyForPdf(fdReturn)}`,
      `Additional Gain vs FD: ${formatCurrencyForPdf(additionalGain)}`,
      "",
      "*Indicative projections only. Not investment advice.",
    ];

    const canvas = document.createElement("canvas");
    canvas.width = 1240;
    canvas.height = 1754;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let logoBottom = 70;
    try {
      const logo = await loadImage(vilaasaLogo);
      const logoWidth = 220;
      const logoHeight = (logo.height / logo.width) * logoWidth;
      ctx.drawImage(logo, 70, 56, logoWidth, logoHeight);
      logoBottom = 56 + logoHeight;
    } catch {
      ctx.fillStyle = "#0c1a14";
      ctx.font = "700 34px serif";
      ctx.fillText("VILAASA ESTATE", 70, 96);
      logoBottom = 120;
    }

    const titleY = logoBottom + 44;
    const subtitleY = titleY + 34;
    const reportY = subtitleY + 42;

    ctx.fillStyle = "#0b2a1d";
    ctx.font = "700 48px serif";
    ctx.fillText("VILAASA ESTATE", 70, titleY);

    ctx.fillStyle = "#6b7280";
    ctx.font = "400 24px serif";
    ctx.fillText("The Luxury of Certainty", 70, subtitleY);

    ctx.fillStyle = "#0c1a14";
    ctx.font = "700 32px serif";
    ctx.fillText("Wealth Projection Report", 70, reportY);

    ctx.strokeStyle = "#b79a5a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, reportY + 26);
    ctx.lineTo(canvas.width - 70, reportY + 26);
    ctx.stroke();

    let y = reportY + 70;
    ctx.fillStyle = "#1f2937";
    lines.forEach((line) => {
      if (line.trim() === "") {
        y += 12;
        return;
      }
      if (line === "Inputs" || line === "Projected Outputs" || line === "Benchmark Comparison") {
        ctx.font = "700 20px sans-serif";
        ctx.fillStyle = "#0c1a14";
        ctx.fillText(line, 70, y);
        y += 32;
        ctx.font = "400 17px sans-serif";
        ctx.fillStyle = "#1f2937";
        return;
      }
      ctx.font = "400 17px sans-serif";
      ctx.fillText(line, 70, y);
      y += 28;
    });

    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const jpegBytes = dataUrlToUint8Array(jpegDataUrl);
    const pdfBytes = buildPdfFromJpeg(jpegBytes, canvas.width, canvas.height);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vilaasa-wealth-report-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />

      <header className="bg-gradient-to-b from-[#0c1a14] to-background px-4 pb-12 pt-24 md:px-10 md:pb-16 md:pt-32">
        <div className="mx-auto max-w-[1280px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold/60">
              Private Banking Tool
            </span>
            <h1 className="mb-4 mt-4 font-serif text-3xl font-light text-foreground sm:text-4xl md:text-6xl">
              The Vilaasa <span className="italic text-gold">Wealth Projector</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
              Project your returns across different currencies and geographies. A
              sophisticated tool designed for discerning investors.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="px-4 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 md:space-y-10"
            >
              <div className="rounded-lg border border-border bg-card p-5 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-gold">public</span>
                  <h2 className="text-xl font-medium text-foreground">Global Context</h2>
                </div>

                <div className="mb-6">
                  <label className="mb-3 block text-sm text-muted-foreground">
                    Select Currency
                  </label>
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                    {(["INR", "USD", "AED"] as const).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => {
                          const rate = getFxRate(curr) / getFxRate(currency);
                          setInvestmentAmount(Math.round(investmentAmount * rate));
                          setCurrency(curr);
                        }}
                        className={`rounded-md px-2 py-3 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                          currency === curr
                            ? "bg-gold text-gold-foreground shadow-lg"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {currencySymbols[curr]} {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm text-muted-foreground">
                    Select Region
                  </label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {Object.entries(regionYields).map(([key, { label, defaultYield }]) => (
                        <SelectItem key={key} value={key}>
                          {label} (Typical Yield: {defaultYield}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">
                      Expected Annual Yield
                    </label>
                    <span className="font-mono text-lg font-bold text-gold">{customYield}%</span>
                  </div>
                  <Slider
                    value={[customYield]}
                    onValueChange={(val) => setCustomYield(val[0])}
                    min={1}
                    max={30}
                    step={0.5}
                    className="[&_[role=slider]]:border-gold [&_[role=slider]]:bg-gold [&_.bg-primary]:bg-gold"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Adjust based on your specific investment type
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-gold">
                    account_balance
                  </span>
                  <h2 className="text-xl font-medium text-foreground">Investment Scenarios</h2>
                </div>

                <div className="mb-8">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">Investment Amount</label>
                    <span className="font-mono text-lg font-bold text-gold sm:text-xl">
                      {currencySymbols[currency]}{" "}
                      {investmentAmount >= 10000000
                        ? `${(investmentAmount / 10000000).toFixed(2)} Cr`
                        : investmentAmount >= 100000
                          ? `${(investmentAmount / 100000).toFixed(2)} L`
                          : investmentAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Slider
                    value={[investmentAmount]}
                    onValueChange={(val) => setInvestmentAmount(val[0])}
                    min={range.min}
                    max={range.max}
                    step={range.min / 10}
                    className="[&_[role=slider]]:border-gold [&_[role=slider]]:bg-gold [&_.bg-primary]:bg-gold"
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>
                      {currencySymbols[currency]}
                      {currency === "INR" ? "45L" : Math.round(range.min).toLocaleString()}
                    </span>
                    <span>
                      {currencySymbols[currency]}
                      {currency === "INR" ? "20Cr" : Math.round(range.max).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="mb-3 block text-sm text-muted-foreground">
                    Investment Duration
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                    {durationOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDuration(opt.value)}
                        className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                          duration === opt.value
                            ? "border-gold bg-gold/20 text-gold"
                            : "border-border text-muted-foreground hover:border-gold/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm text-muted-foreground">
                    Expected Occupancy / Performance
                  </label>
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                    {performanceOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPerformance(opt.value)}
                        className={`rounded-md px-2 py-3 text-xs transition-all sm:text-sm ${
                          performance === opt.value
                            ? "bg-background text-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="block font-medium">{opt.label}</span>
                        <span className="text-xs opacity-70">{opt.percentage}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="overflow-hidden rounded-lg border border-gold/30 bg-[#FDF8F0]">
                <div className="bg-[#0c1a14] p-5 text-white md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-gold/80">
                        Wealth Projection
                      </h3>
                      <p className="mt-1 text-xl font-serif sm:text-2xl">Financial Statement</p>
                    </div>
                    <span className="material-symbols-outlined text-4xl text-gold/40">
                      assessment
                    </span>
                  </div>
                </div>

                <div className="space-y-5 p-5 md:space-y-6 md:p-8">
                  <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                    <span className="font-serif text-[#0c1a14]">Est. Annual Yield</span>
                    <span className="font-mono text-2xl font-bold text-primary">
                      {effectiveYield.toFixed(1)}%
                    </span>
                  </div>

                  <div className="rounded-lg bg-[#0c1a14] p-6 text-center">
                    <p className="mb-2 text-sm uppercase tracking-wider text-gold/70">
                      Monthly Payout
                    </p>
                    <p className="font-mono text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                      <AnimatedNumber
                        value={monthlyPayout}
                        prefix={currencySymbols[currency]}
                        decimals={2}
                      />
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="font-serif text-[#0c1a14]/70">
                      Total Payout over {duration} Years
                    </span>
                    <span className="font-mono text-lg font-bold text-[#0c1a14] sm:text-xl">
                      {formatCurrency(totalRentalIncome)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gold/20 py-3">
                    <div>
                      <span className="block font-serif text-[#0c1a14]/70">
                        Projected Asset Value
                      </span>
                      <span className="text-xs text-[#0c1a14]/50">
                        ({capitalAppreciation}% annual appreciation)
                      </span>
                    </div>
                    <span className="font-mono text-lg font-bold text-[#0c1a14] sm:text-xl">
                      {formatCurrency(futureAssetValue)}
                    </span>
                  </div>

                  <div className="mt-4 rounded-lg bg-gold/10 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-wider text-[#0c1a14]/70">
                          Total ROI
                        </p>
                        <p className="text-xs text-[#0c1a14]/50">(Rental + Appreciation)</p>
                      </div>
                      <span className="font-mono text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
                        <AnimatedNumber
                          value={totalROI}
                          prefix={currencySymbols[currency]}
                          decimals={2}
                        />
                      </span>
                    </div>
                  </div>

                  <p className="text-center text-xs italic text-[#0c1a14]/50">
                    *Projections based on market averages. Past performance is not
                    indicative of future results.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button
                  variant="hero"
                  className="flex-1 gap-2"
                  onClick={() => void downloadReportPdf()}
                >
                  <span className="material-symbols-outlined">download</span>
                  Download Report
                </Button>
                <Link to="/calendar" className="flex-1">
                  <Button variant="heroOutline" className="w-full gap-2">
                    <span className="material-symbols-outlined">mail</span>
                    Get Consultation
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card px-4 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-[1280px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center md:mb-12"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold/60">
              The Opportunity Cost
            </span>
            <h2 className="mb-4 mt-4 font-serif text-2xl font-light text-foreground sm:text-3xl md:text-4xl">
              Smart Money <span className="italic text-gold">Comparison</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              See how your investment in Vilaasa Estate compares to traditional
              banking options
            </p>
          </motion.div>

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-[320px] rounded-lg border border-border bg-background p-4 sm:h-[360px] md:h-[400px] md:p-6"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  layout="vertical"
                  margin={{ top: 20, right: 20, left: 5, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Total Return"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={44}>
                    {comparisonData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4 md:space-y-6"
            >
              <div className="rounded-lg border border-gold/20 bg-[#0c1a14] p-5 md:p-8">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-4xl text-gold">
                    trending_up
                  </span>
                  <div>
                    <h3 className="mb-2 text-lg font-medium text-white md:text-xl">
                      The Vilaasa Advantage
                    </h3>
                    <p className="mb-6 leading-relaxed text-white/70">
                      By choosing Vilaasa Estate over a traditional Fixed Deposit,
                      you potentially gain an additional:
                    </p>
                    <div className="inline-block rounded-lg bg-gold/20 p-4">
                      <span className="font-mono text-2xl font-bold text-gold sm:text-3xl md:text-4xl">
                        <AnimatedNumber
                          value={Math.max(0, additionalGain)}
                          prefix={currencySymbols[currency]}
                          decimals={2}
                        />
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-white/50">
                      over {duration} years compared to traditional banking at {fdRate}% p.a.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-5 md:p-6">
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    Vilaasa Return
                  </p>
                  <p className="font-mono text-2xl font-bold text-primary">
                    {formatCurrency(totalROI)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    @ {effectiveYield.toFixed(1)}% effective yield
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-5 md:p-6">
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    Bank FD Return
                  </p>
                  <p className="font-mono text-2xl font-bold text-muted-foreground">
                    {formatCurrency(fdReturn)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">@ {fdRate}% p.a. (standard)</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-[900px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 font-serif text-2xl font-light text-foreground sm:text-3xl md:text-4xl">
              Ready to Project Your <span className="italic text-gold">Wealth?</span>
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Connect with our investment advisors for a personalized wealth projection
              tailored to your financial goals.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/calendar" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="w-full gap-2 sm:w-auto">
                  <span className="material-symbols-outlined">calendar_month</span>
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WealthProjector;
