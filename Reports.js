// ===== DATA =====
const transactions = [
  { name: "Maria Gomez",     desc: "Grocery items & supplies", amount: 45.00,  date: "2026-07-28", status: "On Time" },
  { name: "Carlos Mendoza",  desc: "Weekly hardware credit",   amount: 120.00, date: "2026-07-25", status: "Pending" },
  { name: "Ana Ruiz",        desc: "Bakery stock order",       amount: 85.50,  date: "2026-07-18", status: "Overdue" },
  { name: "Luis Torres",     desc: "Cleaning products",        amount: 60.00,  date: "2026-07-17", status: "On Time" },
  { name: "Rosa Diaz",       desc: "School supplies",          amount: 38.75,  date: "2026-07-16", status: "On Time" },
  { name: "Pedro Castillo",  desc: "Bulk rice & beans",        amount: 150.00, date: "2026-07-16", status: "Pending" },
  { name: "Carmen Morales",  desc: "Fresh produce supply",     amount: 92.00,  date: "2026-07-15", status: "On Time" },
  { name: "Jorge Ramirez",   desc: "Electrical hardware",      amount: 210.00, date: "2026-07-12", status: "Pending" }
];

const PER_PAGE = 3;
let filtered = [...transactions];
let currentPage = 1;

// ===== ELEMENTS =====
const tableBody  = document.getElementById("tableBody");
const pagination = document.getElementById("pagination");
const dateStart  = document.getElementById("dateStart");
const dateEnd    = document.getElementById("dateEnd");
const customerSel = document.getElementById("customerSelect");
const toast      = document.getElementById("toast");

// ===== HELPERS =====
const badgeClass = s => ({ "On Time": "ok", "Pending": "pending", "Overdue": "overdue" }[s]);
const money = n => "$" + n.toFixed(2);

function showToast(msg) {
  toast.innerHTML = '<i class="fa-solid fa-circle-check"></i>' + msg;
  toast.classList.add("show");
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===== CUSTOMER SELECT =====
[...new Set(transactions.map(t => t.name))].forEach(n => {
  const o = document.createElement("option");
  o.value = n; o.textContent = n;
  customerSel.appendChild(o);
});

// ===== RENDER TABLE =====
function renderTable() {
  const start = (currentPage - 1) * PER_PAGE;
  const rows = filtered.slice(start, start + PER_PAGE);

  tableBody.innerHTML = rows.length
    ? rows.map(t => `
      <tr>
        <td><b>${t.name}</b></td>
        <td>${t.desc}</td>
        <td>${money(t.amount)}</td>
        <td>${t.date}</td>
        <td><span class="badge ${badgeClass(t.status)}">${t.status}</span></td>
      </tr>`).join("")
    : '<tr><td colspan="5" class="empty">No transactions found for these filters.</td></tr>';

  renderPagination();
}

// ===== PAGINATION =====
function renderPagination() {
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  pagination.innerHTML = "";
  for (let i = 1; i <= pages; i++) {
    const b = document.createElement("button");
    b.className = "page" + (i === currentPage ? " active" : "");
    b.textContent = i;
    b.addEventListener("click", () => { currentPage = i; renderTable(); });
    pagination.appendChild(b);
  }
}

// ===== CALENDAR ICONS =====
function openPicker(input) {
  if (input.showPicker) input.showPicker(); else input.focus();
}
document.getElementById("openStart").addEventListener("click", () => openPicker(dateStart));
document.getElementById("openEnd").addEventListener("click", () => openPicker(dateEnd));
dateStart.addEventListener("click", () => openPicker(dateStart));
dateEnd.addEventListener("click", () => openPicker(dateEnd));

// ===== APPLY FILTERS =====
document.getElementById("btnApply").addEventListener("click", () => {
  const from = dateStart.value, to = dateEnd.value, who = customerSel.value;

  if (from && to && from > to) {
    showToast("Start date must be before end date");
    return;
  }

  filtered = transactions.filter(t =>
    (!from || t.date >= from) &&
    (!to || t.date <= to) &&
    (who === "all" || t.name === who)
  );
  currentPage = 1;
  renderTable();
  showToast("Filters applied (" + filtered.length + " results)");
});

// ===== EXPORT EXCEL (CSV opens in Excel) =====
document.getElementById("btnExcel").addEventListener("click", () => {
  const header = ["Customer Name", "Description", "Amount", "Date", "Status"];
  const esc = v => '"' + String(v).replace(/"/g, '""') + '"';
  const lines = [header, ...filtered.map(t => [t.name, t.desc, t.amount.toFixed(2), t.date, t.status])]
    .map(r => r.map(esc).join(","));

  const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "FIAO_Reports.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
  showToast("Excel exported successfully");
});

// ===== EXPORT PDF (print dialog -> Save as PDF) =====
document.getElementById("btnPdf").addEventListener("click", () => {
  // show all rows so the PDF has the full table
  const saved = currentPage;
  const full = filtered;
  tableBody.innerHTML = full.map(t => `
    <tr>
      <td><b>${t.name}</b></td><td>${t.desc}</td><td>${money(t.amount)}</td>
      <td>${t.date}</td><td><span class="badge ${badgeClass(t.status)}">${t.status}</span></td>
    </tr>`).join("");
  window.print();
  currentPage = saved;
  renderTable();
});

// ===== INIT =====
renderTable();