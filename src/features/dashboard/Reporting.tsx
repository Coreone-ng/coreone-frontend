"use client";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AppButton, Dialog, Empty, Panel, Search, Status } from "./components";
import { DemoNotice, ModuleHeading, RecordsTable } from "./ModuleUI";
import {
  buildReport,
  chartColors,
  reportBills,
  reportCategories,
  reportCsvRows,
  reportDefinitions,
  reportHref,
  type ReportChart,
  type ReportFilters,
  type ReportId,
  type ReportModel,
  type ReportRow,
  type ReportSource,
  type ValueFormat,
} from "./report-model";
import { downloadDemoCsv } from "./demo";
import { contactName, money } from "./model";
import { useWorkspace } from "./WorkspaceProvider";
import { InvoicePaper } from "./Invoices";
import { JournalDetails } from "./Accounting";
import styles from "./Dashboard.module.css";
import ui from "./Reporting.module.css";
import moduleStyles from "./Modules.module.css";

export function reportValue(value: string | number, format: ValueFormat) {
  if (typeof value === "string") return value;
  if (!Number.isFinite(value)) return "—";
  if (format === "money") return money(value);
  if (format === "percent") return `${value.toFixed(1)}%`;
  if (format === "ratio") return value.toFixed(2);
  if (format === "days") return `${Math.round(value)} days`;
  return value.toLocaleString("en-NG");
}
const numberLabel = (value: number, format: ValueFormat) =>
  format === "money"
    ? `₦${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`
    : format === "ratio"
      ? value.toFixed(1)
      : new Intl.NumberFormat("en", { notation: "compact" }).format(value);
const snapshotIds = ["profit-loss", "balance-sheet"];
export function ReportingHub() {
  const { demo, contacts } = useWorkspace();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All Reports");
  const [notice, setNotice] = useState("");
  const items = reportDefinitions.filter(
    (item) =>
      (category === "All Reports" || item.category === category) &&
      `${item.title} ${item.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function exportAll() {
    const models = reportDefinitions
      .filter((item) => item.id !== "bank-activity")
      .map((item) => buildReport(item.id as ReportId, demo, contacts));
    const rows: (string | number)[][] = models.flatMap((model) => [
      [model.title, "Demo report", model.notice || "Sample data"],
      [
        model.title,
        "Columns",
        model.section,
        ...model.columns.map((column) => column.label),
      ],
      ...model.metrics.map((metric) => [
        model.title,
        "Summary",
        metric.label,
        reportValue(metric.value, metric.format),
      ]),
      ...reportCsvRows(model).map((row) => [model.title, "Record", ...row]),
    ]);
    rows.push([
      "Cash / Bank Activity",
      "Pending",
      "A dedicated report layout is not supplied. Use Accounting › Bank Transactions for its existing preview.",
    ]);
    downloadDemoCsv(
      "coreone-demo-all-reports.csv",
      [
        "Report",
        "Row type",
        "Account / label",
        "Value 1",
        "Value 2",
        "Value 3",
        "Value 4",
        "Value 5",
        "Value 6",
        "Value 7",
      ],
      rows.map((row) => [
        ...row,
        ...Array(Math.max(0, 10 - row.length)).fill(""),
      ]),
    );
    setNotice(
      "Downloaded 12 demo reports in one CSV. Cash / Bank Activity is listed as pending a dedicated report design.",
    );
  }
  return (
    <>
      <ModuleHeading
        section="Reporting"
        title="Reporting"
        description="Get clear insight into your business performance with financial reports."
      >
        <AppButton onClick={exportAll}>
          <img
            src="/assets/dashboard/report-export.svg"
            width="24"
            height="24"
            alt=""
          />
          Export all reports
        </AppButton>
      </ModuleHeading>
      <Panel className={ui.categoryPanel}>
        <div
          role="tablist"
          aria-label="Report categories"
          className={ui.categories}
        >
          {reportCategories.map((item) => (
            <button
              role="tab"
              id={`report-tab-${item.replaceAll(" ", "-")}`}
              key={item}
              aria-selected={category === item}
              aria-controls="report-catalog"
              tabIndex={category === item ? 0 : -1}
              onKeyDown={(event) => {
                if (
                  ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
                ) {
                  event.preventDefault();
                  const index = reportCategories.indexOf(
                    category as (typeof reportCategories)[number],
                  );
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? reportCategories.length - 1
                        : (index +
                            (event.key === "ArrowRight" ? 1 : -1) +
                            reportCategories.length) %
                          reportCategories.length;
                  setCategory(reportCategories[next]);
                  const buttons =
                    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                      "button",
                    );
                  buttons?.[next]?.focus();
                }
              }}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </Panel>
      <Panel className={styles.filters}>
        <Search
          label="Search reports"
          placeholder="Search report..."
          value={query}
          onChange={setQuery}
        />
      </Panel>
      {notice && (
        <p role="status" className={styles.inlineNotice}>
          {notice}
        </p>
      )}
      <Panel className={ui.catalog}>
        <div
          id="report-catalog"
          role="tabpanel"
          aria-labelledby={`report-tab-${category.replaceAll(" ", "-")}`}
        >
          <div className={ui.reportGrid}>
            {items.map((item) => (
              <article key={item.id} className={ui.reportCard}>
                <span className={ui.receipt}>
                  <img
                    src="/assets/dashboard/report-receipt.svg"
                    width="18"
                    height="18"
                    alt=""
                  />
                </span>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <Link
                    href={reportHref(item.id)}
                    aria-label={`View ${item.title} report`}
                  >
                    View report{" "}
                    <img
                      src="/assets/dashboard/report-card-arrow.svg"
                      width="12"
                      height="12"
                      alt=""
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {!items.length && (
            <Empty>No reports match this search and category.</Empty>
          )}
          <p className={ui.catalogNote}>
            {items.length} report{items.length === 1 ? "" : "s"} · demo previews
          </p>
        </div>
      </Panel>
    </>
  );
}

const metricIcons: Record<ReportId, string[]> = {
  "profit-loss": [
    "report-income",
    "report-expenses",
    "report-profit",
    "report-margin",
  ],
  "balance-sheet": [
    "report-income",
    "report-expenses",
    "report-profit",
    "report-margin",
  ],
  "trial-balance": [
    "report-income",
    "report-expenses",
    "report-rotate-right",
    "report-money-change",
  ],
  "general-ledger": [
    "report-income",
    "report-minus-circle",
    "report-add-circle",
    "report-margin",
  ],
  receivables: [
    "report-money-time",
    "report-add-square",
    "report-profile-2user",
    "report-profit",
  ],
  payables: [
    "report-money-time",
    "report-add-square",
    "report-profile-2user",
    "report-profit",
  ],
  "expenses-summary": [
    "report-moneys",
    "report-profit",
    "report-note-text",
    "report-profit",
  ],
  "cash-flow": [
    "report-income",
    "report-expenses",
    "report-profit",
    "report-margin",
  ],
  "sales-summary": [
    "report-income",
    "report-expenses",
    "report-profit",
    "report-margin",
  ],
  "customer-sales": [
    "report-income",
    "report-expenses",
    "report-profit",
    "report-margin",
  ],
  "journal-entries": [
    "report-income",
    "report-expenses",
    "report-profit",
    "report-margin",
  ],
  "financial-ratios": [
    "report-income",
    "report-expenses",
    "report-profit",
    "report-margin",
  ],
};
function ReportMetrics({ model }: { model: ReportModel }) {
  return (
    <Panel className={ui.metrics}>
      {model.metrics.map((metric, index) => (
        <div key={metric.label}>
          <p>
            <img
              src={`/assets/dashboard/${metricIcons[model.id][index % 4]}.svg`}
              width="20"
              height="20"
              alt=""
            />
            {metric.label}
          </p>
          <strong>{reportValue(metric.value, metric.format)}</strong>
          <small>{metric.hint || "Illustrative demo data"}</small>
        </div>
      ))}
    </Panel>
  );
}
function Chart({
  chart,
  previous = false,
}: {
  chart: ReportChart;
  previous?: boolean;
}) {
  const [range, setRange] = useState("all");
  const plotRef = useRef<SVGSVGElement>(null);
  const [plotWidth, setPlotWidth] = useState(600);
  const chartHasData = chart.series.some((item) =>
    item.values.some((value) => value > 0),
  );
  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const observer = new ResizeObserver(() =>
      setPlotWidth(Math.max(240, plot.clientWidth)),
    );
    observer.observe(plot);
    return () => observer.disconnect();
  }, [chart.kind, chart.labels.length, range, previous, chartHasData]);
  const [active, setActive] = useState<number>();
  const id = useId().replaceAll(":", "");
  const monthNames = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const monthly =
    chart.labels.length > 1 &&
    chart.labels.every((label) => monthNames.includes(label));
  const last =
    previous && chart.labels.includes("Sep")
      ? chart.labels.indexOf("Sep") + 1
      : chart.labels.length;
  const start =
    range === "last"
      ? Math.max(0, last - 1)
      : range === "recent"
        ? Math.max(0, last - 2)
        : 0;
  const labels = chart.labels.slice(start, last);
  const series = chart.series.map((item) => ({
    ...item,
    values: item.values.slice(start, last),
  }));
  const max = Math.max(1, ...series.flatMap((item) => item.values));
  const plotMax =
    Math.ceil(max / (max > 100000 ? 100000 : max > 10 ? 10 : 0.5)) *
    (max > 100000 ? 100000 : max > 10 ? 10 : 0.5);
  const x = (index: number) =>
    65 + (index + 0.5) * ((plotWidth - 95) / Math.max(labels.length, 1));
  const slot = (plotWidth - 95) / Math.max(labels.length, 1);
  const barWidth = Math.min(24, slot / (series.length + 1));
  const y = (value: number) => 238 - (value / plotMax) * 205;
  const summary = (index: number) =>
    `${labels[index]}: ${series.map((item) => `${item.label} ${reportValue(item.values[index], chart.format)}`).join("; ")}`;
  const total = series[0]?.values.reduce((sum, value) => sum + value, 0) || 0;
  let offset = 0;
  return (
    <Panel className={ui.chartPanel}>
      <div className={ui.sectionHeading}>
        <h2>{chart.title}</h2>
        {monthly && (
          <select
            aria-label={`${chart.title} period`}
            value={range}
            onChange={(event) => {
              setRange(event.target.value);
              setActive(undefined);
            }}
          >
            <option value="all">May–{previous ? "Sep" : "Oct"} 2026</option>
            <option value="recent">Last two months</option>
            <option value="last">{previous ? "Sep" : "Oct"} 2026</option>
          </select>
        )}
      </div>
      {!labels.length ||
      !series.some((item) => item.values.some((value) => value > 0)) ? (
        <Empty>No data for this demo selection.</Empty>
      ) : chart.kind === "donut" ? (
        <div className={ui.donutLayout}>
          <svg
            viewBox="0 0 200 200"
            role="img"
            aria-label={`${chart.title}, demo distribution`}
          >
            <circle
              cx="100"
              cy="100"
              r="68"
              fill="none"
              stroke="#f2f4f7"
              strokeWidth="30"
            />
            {series[0].values.map((value, index) => {
              const length = total ? (value / total) * 427.2566 : 0;
              const segment = (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="68"
                  fill="none"
                  stroke={chartColors[index % chartColors.length]}
                  strokeWidth={active === index ? 34 : 30}
                  strokeDasharray={`${length} ${427.2566 - length}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 100 100)"
                >
                  <title>{summary(index)}</title>
                </circle>
              );
              offset += length;
              return segment;
            })}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className={ui.donutCaption}
            >
              Demo total
            </text>
            <text x="100" y="118" textAnchor="middle" className={ui.donutTotal}>
              {numberLabel(total, chart.format)}
            </text>
          </svg>
          <div className={ui.chartLegend}>
            {labels.map((label, index) => (
              <button
                key={`${label}-${index}`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                aria-pressed={active === index}
              >
                <i
                  style={{
                    background: chartColors[index % chartColors.length],
                  }}
                />
                <span>
                  {label}
                  <small>
                    {reportValue(series[0].values[index], chart.format)} ·{" "}
                    {total
                      ? ((series[0].values[index] / total) * 100).toFixed(1)
                      : 0}
                    %
                  </small>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className={ui.seriesLegend}>
            {series.map((item) => (
              <span key={item.label}>
                <i style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
          <svg
            ref={plotRef}
            viewBox={`0 0 ${plotWidth} 280`}
            className={ui.plot}
            role="img"
            aria-label={`${chart.title}, illustrative demo chart. Focus a data point for its values.`}
          >
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop stopColor={series[0].color} stopOpacity=".18" />
                <stop offset="1" stopColor={series[0].color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {Array.from({ length: 6 }, (_, index) => {
              const value = (plotMax * index) / 5;
              return (
                <g key={index}>
                  <line
                    x1="60"
                    x2={plotWidth - 20}
                    y1={y(value)}
                    y2={y(value)}
                    stroke="#eaecf0"
                    strokeDasharray="4 4"
                  />
                  <text x="52" y={y(value) + 4} textAnchor="end">
                    {numberLabel(value, chart.format)}
                  </text>
                </g>
              );
            })}
            {chart.kind === "line" &&
              series.map((item) => (
                <g key={item.label}>
                  <path
                    d={`M ${x(0)} 238 L ${item.values.map((value, index) => `${x(index)} ${y(value)}`).join(" L ")} L ${x(item.values.length - 1)} 238 Z`}
                    fill={`url(#${id})`}
                  />
                  <polyline
                    points={item.values
                      .map((value, index) => `${x(index)},${y(value)}`)
                      .join(" ")}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="3"
                  />
                </g>
              ))}
            {labels.map((label, index) => (
              <g
                key={`${label}-${index}`}
                tabIndex={0}
                role="button"
                aria-label={summary(index)}
                onFocus={() => setActive(index)}
                onMouseEnter={() => setActive(index)}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActive(index);
                  }
                }}
              >
                <rect
                  x={x(index) - slot / 2}
                  y="25"
                  width={slot}
                  height="214"
                  fill={active === index ? "#f2f4f7" : "transparent"}
                />
                {series.map((item, seriesIndex) =>
                  chart.kind === "bars" ? (
                    <rect
                      key={item.label}
                      x={
                        x(index) +
                        (seriesIndex - (series.length - 1) / 2) *
                          (barWidth + 2) -
                        barWidth / 2
                      }
                      y={y(item.values[index])}
                      width={barWidth}
                      height={238 - y(item.values[index])}
                      fill={item.color}
                    />
                  ) : (
                    <circle
                      key={item.label}
                      cx={x(index)}
                      cy={y(item.values[index])}
                      r={active === index ? 6 : 4}
                      fill={item.color}
                    />
                  ),
                )}
                <text x={x(index)} y="264" textAnchor="middle">
                  {plotWidth < 400
                    ? label.replace(" Ratio", "")
                    : label.length > 12
                      ? label.slice(0, 10) + "…"
                      : label}
                </text>
                <title>{summary(index)}</title>
              </g>
            ))}
          </svg>
        </>
      )}
      <output aria-live="polite" className={ui.chartOutput}>
        {active !== undefined && active < labels.length
          ? summary(active)
          : "Hover or focus a chart value to inspect this demo data."}
      </output>
    </Panel>
  );
}
function Insights({ items }: { items: NonNullable<ReportModel["insights"]> }) {
  return (
    <Panel className={ui.insights}>
      <h2>Key Insight</h2>
      {items.map((item, index) => (
        <div key={item.title}>
          <img
            src={`/assets/dashboard/${["report-trend-up", "report-trend-down", "report-category"][index % 3]}.svg`}
            width="24"
            height="24"
            alt=""
          />
          <div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </div>
      ))}
    </Panel>
  );
}
function Statement({
  model,
  period,
  onPeriod,
}: {
  model: ReportModel;
  period: "current" | "previous";
  onPeriod: (value: "current" | "previous") => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  function toggle(id: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function rows(items: ReportRow[], depth = 0): React.ReactNode[] {
    return items.flatMap((item) => [
      <tr
        key={item.id}
        className={`${item.highlight ? ui.totalRow : ""} ${item.children ? ui.groupRow : ""}`}
      >
        <th scope="row" style={{ paddingLeft: 20 + depth * 26 }}>
          {item.children ? (
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={!collapsed.has(item.id)}
              aria-label={`${collapsed.has(item.id) ? "Expand" : "Collapse"} ${item.label}`}
            >
              <img
                src="/assets/dashboard/report-chevron.svg"
                width="20"
                height="20"
                alt=""
                style={{
                  transform: collapsed.has(item.id)
                    ? "rotate(-90deg)"
                    : undefined,
                }}
              />
              {item.label}
            </button>
          ) : (
            item.label
          )}
        </th>
        {item.values.map((value, index) => (
          <td key={index}>
            {model.columns[index]?.format === "percent" ? (
              <span
                className={
                  typeof value === "number" && value < 0
                    ? ui.negative
                    : ui.positive
                }
              >
                {typeof value === "number" && value > 0
                  ? "↑ "
                  : typeof value === "number" && value < 0
                    ? "↓ "
                    : ""}
                {reportValue(value, model.columns[index].format)}
              </span>
            ) : (
              reportValue(value, model.columns[index]?.format || "text")
            )}
          </td>
        ))}
      </tr>,
      ...(!collapsed.has(item.id) && item.children
        ? rows(item.children, depth + 1)
        : []),
    ]);
  }
  return (
    <>
      <Panel className={ui.sectionHeading}>
        <h2>{model.section}</h2>
        {snapshotIds.includes(model.id) ? (
          <select
            aria-label="Statement period"
            value={period}
            onChange={(event) =>
              onPeriod(event.target.value as "current" | "previous")
            }
          >
            <option value="current">Oct 2026 vs Sep 2026</option>
            <option value="previous">Sep 2026</option>
          </select>
        ) : (
          <span className={ui.periodLabel}>October 2026 · demo</span>
        )}
      </Panel>
      <Panel className={ui.statement}>
        <div
          className={styles.tableScroll}
          role="region"
          tabIndex={0}
          aria-label={`${model.title} statement`}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">
                  {model.id === "financial-ratios" ? "Ratio" : "Account"}
                </th>
                {model.columns.map((column) => (
                  <th scope="col" key={column.label}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{rows(model.rows)}</tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
const statementIds = [
  "profit-loss",
  "balance-sheet",
  "cash-flow",
  "trial-balance",
  "financial-ratios",
];
export function ReportingDetail({ id }: { id: ReportId }) {
  const { demo, contacts } = useWorkspace();
  const [filters, setFilters] = useState<ReportFilters>({});
  const [period, setPeriod] = useState<"current" | "previous">("current");
  const [source, setSource] = useState<{
    source: ReportSource;
    action: "transaction" | "journal" | "document";
  }>();
  const [notice, setNotice] = useState("");
  const model = useMemo(
    () => buildReport(id, demo, contacts, filters, period),
    [id, demo, contacts, filters, period],
  );
  const all = useMemo(
    () => buildReport(id, demo, contacts),
    [id, demo, contacts],
  );
  const set = (key: keyof ReportFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const statement = statementIds.includes(id);
  const expense = id === "expenses-summary";
  const exportReport = () => {
    downloadDemoCsv(
      `coreone-demo-${id}.csv`,
      [
        statement || expense ? "Account / category" : model.section,
        ...model.columns.map((column) => column.label),
      ],
      reportCsvRows(model),
    );
    setNotice(
      "Demo CSV downloaded with the current filters and all matching rows, including collapsed statement groups.",
    );
  };
  const canActions = [
    "general-ledger",
    "receivables",
    "payables",
    "journal-entries",
  ].includes(id);
  function sourceActions(row: ReportRow) {
    if (!row.source) return undefined;
    const ref = row.source;
    return [
      {
        label: "View transaction details",
        onClick: () => setSource({ source: ref, action: "transaction" }),
      },
      ...(ref.kind === "journal"
        ? [
            {
              label: "View journal entry",
              onClick: () =>
                setSource({ source: ref, action: "journal" as const }),
            },
          ]
        : []),
      {
        label: "View source document",
        onClick: () => setSource({ source: ref, action: "document" }),
      },
    ];
  }
  const parties =
    id === "payables"
      ? reportBills.map((bill) => ({ id: bill.id, label: bill.name }))
      : contacts.map((contact) => ({
          id: contact.id,
          label: contactName(contact),
        }));
  const journal =
    source?.source.kind === "journal"
      ? demo.journals.find((item) => item.id === source.source.id)
      : undefined;
  const invoice =
    source?.source.kind === "invoice"
      ? demo.invoices.find((item) => item.id === source.source.id)
      : undefined;
  const bill =
    source?.source.kind === "bill"
      ? reportBills.find((item) => item.id === source.source.id)
      : undefined;
  return (
    <>
      <div className={ui.backLink}>
        <Link href="/dashboard/reporting">← All reports</Link>
      </div>
      <ModuleHeading
        section={`Reporting › ${model.title}`}
        title={model.title}
        description={model.description}
      >
        <AppButton onClick={exportReport}>
          <img
            src="/assets/dashboard/report-export.svg"
            width="24"
            height="24"
            alt=""
          />
          Export report
        </AppButton>
      </ModuleHeading>
      <ReportMetrics model={model} />
      <DemoNotice>
        {model.notice ||
          "Illustrative demo data. No real financial report has been generated."}
      </DemoNotice>
      {notice && (
        <p role="status" className={styles.inlineNotice}>
          {notice}
        </p>
      )}
      {model.charts && (
        <div
          className={
            model.insights?.length ? ui.chartAndInsights : ui.chartGrid
          }
        >
          {model.charts.map((chart) => (
            <Chart
              key={chart.title}
              chart={chart}
              previous={period === "previous"}
            />
          ))}
          {model.insights?.length && <Insights items={model.insights} />}
        </div>
      )}
      {statement ? (
        <Statement
          key={id}
          model={model}
          period={period}
          onPeriod={setPeriod}
        />
      ) : (
        <>
          {!expense && (
            <Panel className={styles.filters}>
              <Search
                label={`Search ${model.title}`}
                placeholder={`Search ${id.includes("sales") ? "customers" : model.title.toLowerCase()}`}
                value={filters.query || ""}
                onChange={(value) => set("query", value)}
              />
              {[
                "receivables",
                "payables",
                "sales-summary",
                "customer-sales",
              ].includes(id) && (
                <select
                  aria-label={
                    id === "payables" ? "Filter vendor" : "Filter customer"
                  }
                  value={filters.party || ""}
                  onChange={(event) => set("party", event.target.value)}
                >
                  <option value="">
                    {id === "payables" ? "All Vendors" : "All Customers"}
                  </option>
                  {parties.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} · {item.id}
                    </option>
                  ))}
                </select>
              )}
              {["receivables", "payables"].includes(id) && (
                <select
                  aria-label="Filter report status"
                  value={filters.status || ""}
                  onChange={(event) => set("status", event.target.value)}
                >
                  <option value="">All Status</option>
                  {Array.from(new Set(all.rows.map((row) => row.status)))
                    .filter(Boolean)
                    .map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                </select>
              )}
              {id === "general-ledger" && (
                <>
                  <select
                    aria-label="Filter ledger category"
                    value={filters.category || ""}
                    onChange={(event) => set("category", event.target.value)}
                  >
                    <option value="">All Category</option>
                    {Array.from(new Set(all.rows.map((row) => row.category)))
                      .filter(Boolean)
                      .map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                  </select>
                  <select
                    aria-label="Filter ledger account"
                    value={filters.account || ""}
                    onChange={(event) => set("account", event.target.value)}
                  >
                    <option value="">All Account</option>
                    {Array.from(
                      new Set(all.rows.map((row) => row.account)),
                    ).map((account) => (
                      <option key={account}>{account}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter transaction type"
                    value={filters.transaction || ""}
                    onChange={(event) => set("transaction", event.target.value)}
                  >
                    <option value="">All Transactions</option>
                    <option value="journal">Journal Entries</option>
                  </select>
                </>
              )}
              {["sales-summary", "customer-sales"].includes(id) && (
                <select
                  aria-label="Sales balance"
                  value={filters.balance || ""}
                  onChange={(event) => set("balance", event.target.value)}
                >
                  <option value="">All Sales Amounts</option>
                  <option value="outstanding">Outstanding</option>
                  <option value="paid">Paid in full</option>
                </select>
              )}
              <label>
                <span className="sr-only">Report date</span>
                <input
                  aria-label="Report date"
                  type="date"
                  value={filters.date || ""}
                  onChange={(event) => set("date", event.target.value)}
                />
              </label>
              <AppButton variant="secondary" onClick={() => setFilters({})}>
                Reset filters
              </AppButton>
            </Panel>
          )}
          {expense && (
            <Panel className={ui.sectionHeading}>
              <h2>Expense Breakdown</h2>
              <span className={ui.periodLabel}>October 2026 · demo</span>
            </Panel>
          )}
          <RecordsTable
            key={JSON.stringify(filters)}
            label={`${model.title} demo records`}
            headers={[
              expense ? "Category" : model.section,
              ...model.columns.map((column) => column.label),
              ...(canActions ? ["Action"] : []),
            ]}
            rows={model.rows.map((row) => ({
              id: row.id,
              cells: [
                row.source ? (
                  <button
                    key="name"
                    className={styles.recordButton}
                    onClick={() =>
                      setSource({
                        source: row.source!,
                        action:
                          row.source!.kind === "journal"
                            ? "journal"
                            : "transaction",
                      })
                    }
                  >
                    {row.label}
                  </button>
                ) : (
                  row.label
                ),
                ...row.values.map((value, index) =>
                  model.columns[index].label === "Status" ? (
                    <Status key={index}>{value}</Status>
                  ) : (
                    reportValue(value, model.columns[index].format)
                  ),
                ),
              ],
              actions: sourceActions(row),
            }))}
          />
        </>
      )}
      {source &&
        (journal && source.action !== "document" ? (
          <JournalDetails
            journal={journal}
            onClose={() => setSource(undefined)}
          />
        ) : invoice ? (
          <Dialog
            title={`Demo invoice ${invoice.number}`}
            className={moduleStyles.documentDialog}
            onClose={() => setSource(undefined)}
          >
            <InvoicePaper invoice={invoice} />
            <div className={styles.dialogActions}>
              <Link
                href={`/dashboard/invoicing?invoice=${encodeURIComponent(invoice.id)}`}
                className={styles.button}
              >
                Open invoice
              </Link>
              <AppButton onClick={() => window.print()}>
                Print / Save PDF
              </AppButton>
            </div>
          </Dialog>
        ) : (
          <Dialog
            title={
              source.action === "document"
                ? "Source document"
                : "Demo bill details"
            }
            onClose={() => setSource(undefined)}
          >
            {bill ? (
              <dl className={moduleStyles.detailList}>
                {[
                  ["Vendor", `${bill.name} · ${bill.business}`],
                  ["Bill", bill.number],
                  ["Issued", bill.date],
                  ["Due", bill.due],
                  ["Amount", money(bill.amount)],
                  ["Balance", money(bill.balance)],
                  ["Status", bill.status],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <DemoNotice>
              {source.action === "document"
                ? "No source document was supplied for this demo record. No file has been uploaded or generated."
                : "This sample bill is read-only. Vendor bill editing and payment allocation remain pending."}
            </DemoNotice>
            <AppButton onClick={() => setSource(undefined)}>Close</AppButton>
          </Dialog>
        ))}
    </>
  );
}
