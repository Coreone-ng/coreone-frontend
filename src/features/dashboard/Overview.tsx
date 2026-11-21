"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { AppButton, Icon, Panel, PendingDialog } from "./components";
import styles from "./Dashboard.module.css";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const cashIn = [600, 620, 600, 650, 700, 650, 720, 730, 700, 720, 710, 800];
const cashOut = [400, 420, 400, 410, 420, 410, 420, 430, 420, 430, 440, 500];
function Plot({
  type,
  period,
}: {
  type: "cash" | "sales" | "bars";
  period: string;
}) {
  const id = useId().replaceAll(":", "");
  const factor =
    period === "This Quarter" ? 0.75 : period === "This Year" ? 1.4 : 1;
  const values = (
    type === "sales"
      ? [450, 600, 550, 650, 570, 680, 700, 750, 760, 790, 780, 820]
      : cashIn
  ).map((value) => value * factor);
  const width = type === "sales" ? 300 : 550;
  const x = (index: number) => 48 + (index * (width - 78)) / 11;
  const point = (value: number, index: number) =>
    `${x(index)},${240 - value * 0.215}`;
  const line = values.map(point).join(" ");
  const second = cashOut
    .map((value) => value * factor)
    .map(point)
    .join(" ");
  return (
    <svg
      className={styles.plot}
      viewBox={`0 0 ${width} 280`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Illustrative ${type === "bars" ? "income and expenses" : type === "cash" ? "cash flow" : "sales"} chart for ${period.toLowerCase()}; sample values only`}
    >
      <defs>
        <linearGradient id={`${id}fill`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#1bb7ac" stopOpacity=".18" />
          <stop offset="1" stopColor="#1bb7ac" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 200, 400, 600, 800, 1000].map((label, index) => (
        <g key={label}>
          <line
            x1="42"
            y1={240 - index * 43}
            x2={width - 20}
            y2={240 - index * 43}
            stroke="#eef0f3"
          />
          <text x="32" y={244 - index * 43} textAnchor="end">
            {label.toLocaleString()}
          </text>
        </g>
      ))}
      {months.map(
        (month, index) =>
          (type !== "sales" || index % 2 === 0 || index === 11) && (
            <text key={month} x={x(index)} y="264" textAnchor="middle">
              {month}
            </text>
          ),
      )}
      {type === "bars" ? (
        values.map((value, index) => (
          <g key={index}>
            <rect
              x={x(index) - 12}
              y={240 - value * 0.215}
              width="14"
              height={value * 0.215}
              rx="3"
              fill="#2476fa"
            />
            <rect
              x={x(index) + 4}
              y={240 - cashOut[index] * factor * 0.215}
              width="14"
              height={cashOut[index] * factor * 0.215}
              rx="3"
              fill="#18b4ad"
            />
          </g>
        ))
      ) : (
        <>
          <polygon
            points={`48,240 ${line} ${x(11)},240`}
            fill={`url(#${id}fill)`}
          />
          <polyline
            points={line}
            fill="none"
            stroke="#27ae80"
            strokeWidth="3"
          />
          {type === "cash" && (
            <polyline
              points={second}
              fill="none"
              stroke="#4aa2ec"
              strokeWidth="3"
            />
          )}
        </>
      )}
    </svg>
  );
}
function ChartCard({
  title,
  description,
  type,
}: {
  title: string;
  description: string;
  type: "cash" | "sales" | "bars";
}) {
  const [period, setPeriod] = useState("This Month");
  return (
    <Panel className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <label>
          <span className="sr-only">{title} period</span>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            {["This Month", "This Quarter", "This Year"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.legend}>
        <span>
          <i style={{ background: type === "bars" ? "#18b4ad" : "#27ae80" }} />
          {type === "cash" ? "Cash In" : type === "bars" ? "Expenses" : "Sales"}
        </span>
        {type !== "sales" && (
          <span>
            <i
              style={{ background: type === "bars" ? "#2476fa" : "#4aa2ec" }}
            />
            {type === "cash" ? "Cash Out" : "Income"}
          </span>
        )}
      </div>
      <Plot type={type} period={period} />
      <p className={styles.chartCaption}>Month · illustrative values</p>
    </Panel>
  );
}
export function Overview() {
  const [pending, setPending] = useState("");
  const [allActions, setAllActions] = useState(false);
  const [allMetrics, setAllMetrics] = useState(false);
  const router = useRouter();
  return (
    <>
      <h1 className="sr-only">Dashboard overview</h1>
      <Panel className={styles.quickActions}>
        <h2>YOUR QUICK ACTIONS</h2>
        <div
          id="quick-actions"
          className={`${styles.quickButtons} ${allActions ? styles.expanded : ""}`}
        >
          {[
            {
              label: "Accounting",
              icon: "quick-accounting",
              style: "quickAccounting",
            },
            {
              label: "Taxation",
              icon: "quick-taxation",
              style: "quickTaxation",
            },
            {
              label: "Expenses & Bills",
              icon: "quick-expenses",
              style: "quickExpenses",
            },
            { label: "Teams", icon: "quick-teams", style: "quickTeams" },
          ].map((item) => (
            <AppButton
              key={item.label}
              className={styles[item.style]}
              onClick={() =>
                item.label === "Accounting"
                  ? router.push("/dashboard/bank-transactions")
                  : setPending(`${item.label} is coming next`)
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </AppButton>
          ))}
        </div>
        <button
          className={styles.mobileViewAll}
          aria-expanded={allActions}
          aria-controls="quick-actions"
          onClick={() => setAllActions(!allActions)}
        >
          {allActions ? "View less actions" : "View all actions"}
        </button>
      </Panel>
      <div
        id="overview-metrics"
        className={`${styles.overviewStats} ${allMetrics ? styles.expanded : ""}`}
      >
        {[
          { title: "Total Balance", icon: "balance", color: "orange" },
          { title: "Income", icon: "income", color: "green" },
          { title: "Expenses", icon: "spending", color: "blue" },
          { title: "Unpaid Invoices", icon: "unpaid", color: "lime" },
        ].map((item) => (
          <Panel key={item.title}>
            <div className={styles.statTop}>
              <span className={`${styles.metricIcon} ${styles[item.color]}`}>
                <Icon name={item.icon} />
              </span>
              <div>
                <p>{item.title}</p>
                <strong>1Million</strong>
              </div>
            </div>
            <p className={styles.trend}>
              <Icon name="info" />
              <span>
                <Icon name="trend" />
                100%
              </span>{" "}
              vs last month
            </p>
          </Panel>
        ))}
      </div>
      <button
        className={`${styles.mobileViewAll} ${styles.metricViewAll}`}
        aria-expanded={allMetrics}
        aria-controls="overview-metrics"
        onClick={() => setAllMetrics(!allMetrics)}
      >
        {allMetrics ? "View less metrics" : "View all metrics"}
      </button>
      <div className={styles.chartRow}>
        <ChartCard
          title="Cash Flow"
          description="Track the money coming into and going out of your business."
          type="cash"
        />
        <Panel className={styles.chartCard}>
          <h2>Expense Breakdown</h2>
          <p className={styles.muted}>
            See which categories account for the largest share of your spending.
          </p>
          <div
            className={styles.donut}
            role="img"
            aria-label="Sample expenses: operations 30%, marketing 30%, salaries 20%, others 20%"
          >
            <div>
              <span>Total Expenses</span>
              <strong>1000</strong>
            </div>
          </div>
          <div className={styles.donutLegend}>
            {["Operations", "Marketing", "Salaries", "Others"].map(
              (label, index) => (
                <span key={label}>
                  <i
                    style={{
                      background: ["#246bff", "#17b9af", "#e7b216", "#7227db"][
                        index
                      ],
                    }}
                  />
                  {label}
                  <b>{index < 2 ? "30%" : "20%"}</b>
                </span>
              ),
            )}
          </div>
        </Panel>
      </div>
      <div className={`${styles.chartRow} ${styles.reverseCharts}`}>
        <ChartCard
          title="Sales"
          description="Track your sales performance over the selected period."
          type="sales"
        />
        <ChartCard
          title="Income vs. Expenses"
          description="Compare your income and spending over the selected period."
          type="bars"
        />
      </div>
      <div className={styles.chartRow}>
        <Panel className={styles.activity}>
          <div className={styles.chartHeader}>
            <div>
              <h2>Recent Activity</h2>
              <p>Stay up to date with the latest activity in your business.</p>
            </div>
            <button
              onClick={() => setPending("Activity history is coming next")}
            >
              View all
            </button>
          </div>
          {[
            "Invoice created",
            "Expenses recorded",
            "Expenses recorded",
            "Invoice created",
            "Invoice created",
          ].map((label, index) => (
            <div className={styles.activityRow} key={index}>
              <span
                className={`${styles.metricIcon} ${index % 2 ? styles.purple : styles.green}`}
              >
                <Icon name="document" />
              </span>
              <div>
                <strong>{label}</strong>
                <p>INV-0024 · Acme Solutions</p>
              </div>
              <div>
                <strong>{index === 1 ? "− " : ""}₦450,000</strong>
                <p>Today</p>
              </div>
            </div>
          ))}
        </Panel>
        <Panel className={styles.attention}>
          <h2>Needs attention</h2>
          <p className={styles.muted}>
            Review outstanding tasks to keep your business records up to date.
          </p>
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              onClick={() =>
                setPending("Overdue invoice follow-up is coming next")
              }
            >
              <strong>Overdue invoices</strong>
              <span>3 invoices are past their due date.</span>
              <b aria-hidden="true">›</b>
            </button>
          ))}
        </Panel>
      </div>
      {pending && (
        <PendingDialog title={pending} onClose={() => setPending("")} />
      )}
    </>
  );
}
