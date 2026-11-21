// Deliberately illustrative: these records never represent a user's business.
export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  state: string;
  type: "Customer" | "Vendor";
  tin: string;
  legacyTin: string;
  status: "Active" | "Inactive";
  balance: number;
};
export const contactName = (contact: Contact) =>
  `${contact.firstName} ${contact.lastName}`.trim();
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
export const money = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
export const sampleContacts: Contact[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: `sample-${index + 1}`,
    firstName: "Pomaline",
    lastName: "Moses",
    email: "malinepo@gmail.com",
    phone: "08056199263",
    address: "123 King Street West, Surulere",
    country: "Nigeria",
    state: "Lagos",
    type: "Customer",
    tin: "22689227540",
    legacyTin: "",
    status: index === 3 || index === 6 ? "Inactive" : "Active",
    balance: 650000,
  }),
);
export function filterContacts(
  contacts: Contact[],
  query: string,
  type = "",
  status = "",
  balance = "",
  country = "",
) {
  const text = query.trim().toLowerCase();
  return contacts.filter(
    (contact) =>
      (!text ||
        `${contactName(contact)} ${contact.email} ${contact.phone}`
          .toLowerCase()
          .includes(text)) &&
      (!type || contact.type === type) &&
      (!status || contact.status === status) &&
      (!country || contact.country === country) &&
      (!balance ||
        (balance === "outstanding"
          ? contact.balance > 0
          : contact.balance === 0)),
  );
}
export const blankContact: Omit<Contact, "id"> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  country: "",
  state: "",
  type: "Customer",
  tin: "",
  legacyTin: "",
  status: "Active",
  balance: 0,
};
export type InvoiceItem = {
  description: string;
  quantity: number;
  rate: number;
};
export function invoiceTotals(items: InvoiceItem[], discountPercent: number) {
  const round = (amount: number) =>
    Math.round((amount + Number.EPSILON) * 100) / 100;
  const subtotal = round(
    items.reduce(
      (sum, item) =>
        sum +
        Math.max(0, Number.isFinite(item.quantity) ? item.quantity : 0) *
          Math.max(0, Number.isFinite(item.rate) ? item.rate : 0),
      0,
    ),
  );
  const vat = round(subtotal * 0.075);
  const discount = round(
    (subtotal *
      Math.min(
        100,
        Math.max(0, Number.isFinite(discountPercent) ? discountPercent : 0),
      )) /
      100,
  );
  return { subtotal, vat, discount, total: round(subtotal + vat - discount) };
}
export const banks = [
  { id: "access", name: "Access Bank" },
  { id: "zenith", name: "Zenith Bank" },
  { id: "moniepoint", name: "Moniepoint Bank" },
  { id: "opay", name: "Opay" },
  { id: "uba", name: "United Bank for Africa (UBA)" },
  { id: "nom", name: "Nom Bank" },
];
export const sampleInvoices = Array.from({ length: 8 }, (_, index) => ({
  id: `invoice-${index}`,
  number: "INV-028",
  amount: 300000,
  date: "2026-09-24",
  status: [
    "Ongoing",
    "Paid",
    "Paid",
    "Partially Paid",
    "Paid",
    "Paid",
    "Overdue",
    "Paid",
  ][index],
}));
export const samplePayments = Array.from({ length: 8 }, (_, index) => ({
  id: `payment-${index}`,
  number: "PMT-0018",
  amount: 300000,
  invoice: "INV-028",
  method: index % 3 === 0 ? "Bank Transfer" : "Cash",
  date: "2026-09-24",
}));
export const sampleNotes = Array.from({ length: 8 }, (_, index) => ({
  id: `note-${index}`,
  text: [
    "Requested that future invoices go to the accounts email.",
    "Customer confirmed payment commitment for outstanding invoice.",
    "Requested that future invoices go to the accounts email.",
    "Requested that future invoices go to the accounts email.",
    "Customer queried an invoice amount; review before follow-up.",
  ][index % 5],
  category: ["General", "Payment", "General", "General", "Dispute"][index % 5],
  addedTo: "INV-028",
  date: "2026-09-24",
}));
export const sampleTransactions = Array.from({ length: 8 }, (_, index) => ({
  id: `transaction-${index}`,
  date: "2026-09-24",
  description: ["ABC Stores POS", "Transfer received", "Internet subscription"][
    index % 3
  ],
  category: index % 2 === 0 ? "Inward transfer" : "Web payment",
  amount: 650000,
  bank: index === 6 ? "United Bank for Africa (UBA)" : "Moniepoint Bank",
}));
