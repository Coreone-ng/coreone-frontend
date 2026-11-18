import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { filterFaqs } from "../src/features/faq/search.ts";
const entries = JSON.parse(
  readFileSync(
    new URL("../src/features/faq/data/faqs.json", import.meta.url),
    "utf8",
  ),
);

test("blank FAQ search preserves all entries and their source order", () => {
  assert.equal(filterFaqs(entries, "  \n "), entries);
  assert.equal(entries.length, 7);
});
test("FAQ search is case-insensitive and matches all query words in either question or answer", () => {
  assert.deepEqual(
    filterFaqs(entries, "  RIGHT   PLAN ").map((x) => x.question),
    ["Which plan is right for me?"],
  );
  assert.deepEqual(
    filterFaqs(entries, "browser install").map((x) => x.question),
    ["What is Coreone?"],
  );
});
test("unknown searches return no entries and do not mutate source data", () => {
  const before = JSON.stringify(entries);
  assert.deepEqual(filterFaqs(entries, "not-a-question"), []);
  assert.equal(JSON.stringify(entries), before);
});
test("the supplied first FAQ answer remains real copy; missing answers use only the requested lorem ipsum", () => {
  assert.equal(entries[0].placeholder, false);
  assert.match(
    entries[0].answer,
    /Coreone is a cloud-based financial platform/,
  );
  assert.equal(entries.filter((entry) => entry.placeholder).length, 6);
  for (const entry of entries.slice(1))
    assert.match(entry.answer, /^Lorem ipsum dolor sit amet/);
});
