// ---------- DATOS ----------
const clients = [
  { initials: "RB", name: "Ramón Batista", phone: "6123-4567", purchases: 14, debt: 35.00, status: "pending" },
  { initials: "YP", name: "Yolanda Pérez", phone: "6234-8890", purchases: 22, debt: 0,     status: "ontime" },
  { initials: "CR", name: "Carlos Ruiz",   phone: "6301-2245", purchases: 9,  debt: 62.50, status: "overdue" },
  { initials: "MS", name: "Mireya Santos", phone: "6415-7783", purchases: 31, debt: 12.00, status: "pending" }
];

const statusLabels = { ontime: "On Time", pending: "Pending", overdue: "Overdue" };

// ---------- ELEMENTOS ----------
const body        = document.getElementById("clientsBody");
const emptyMsg    = document.getElementById("emptyMsg");
const searchInput = document.getElementById("searchInput");
const chips       = document.querySelectorAll(".chip");
const detailCard  = document.getElementById("detailCard");
const reminder    = document.getElementById("reminderCard");
const heroImg     = document.getElementById("heroImg");

let currentFilter = "all";
let selectedPhone = null;

const money = n => "B/. " + n.toFixed(2);

// ---------- IMAGEN ----------
heroImg.src = "clientes.png";   // pon aquí el nombre de tu imagen (misma carpeta que Client.html)

heroImg.onerror = function () {
  console.log("No se encontró la imagen: " + heroImg.src);
  heroImg.style.display = "none";
};

// ---------- TABLA ----------
function render() {
  const q = searchInput.value.trim().toLowerCase();

  const list = clients.filter(c => {
    const matchFilter = currentFilter === "all" || c.status === currentFilter;
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.phone.replace("-", "").includes(q.replace("-", ""));
    return matchFilter && matchSearch;
  });

  body.innerHTML = list.map(c => `
    <tr>
      <td>
        <div class="client-cell">
          <span class="avatar">${c.initials}</span>
          <div>
            <div class="client-name">${c.name}</div>
            <div class="client-phone">${c.phone}</div>
          </div>
        </div>
      </td>
      <td>${c.purchases} purchases</td>
      <td class="debt">${c.debt > 0 ? money(c.debt) : "-"}</td>
      <td><span class="badge ${c.status}">${statusLabels[c.status]}</span></td>
      <td><a href="#" class="view-link" data-phone="${c.phone}">View detail →</a></td>
    </tr>
  `).join("");

  emptyMsg.hidden = list.length > 0;

  // Si el cliente abierto ya no aparece en la lista, cerramos el detalle
  if (selectedPhone && !list.some(c => c.phone === selectedPhone)) {
    closeDetail();
  }
}

// ---------- DETALLE ----------
function openDetail(phone) {
  const c = clients.find(x => x.phone === phone);
  if (!c) return;
  selectedPhone = phone;
  document.getElementById("detailName").textContent   = c.name;
  document.getElementById("detailPhone").textContent  = c.phone;
  document.getElementById("detailStatus").textContent = statusLabels[c.status];
  document.getElementById("detailDebt").textContent   = money(c.debt);
  detailCard.hidden = false;
  reminder.hidden = true;
  detailCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function closeDetail() {
  selectedPhone = null;
  detailCard.hidden = true;
  reminder.hidden = false;
}

// ---------- EVENTOS ----------
chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    currentFilter = chip.dataset.filter;
    render();
  });
});

searchInput.addEventListener("input", render);

body.addEventListener("click", e => {
  const link = e.target.closest(".view-link");
  if (!link) return;
  e.preventDefault();
  openDetail(link.dataset.phone);
});

document.getElementById("closeDetail").addEventListener("click", closeDetail);

// ---------- BOTÓN SENT (recordatorio por WhatsApp) ----------
const sentBtn = document.getElementById("sentBtn");

sentBtn.addEventListener("click", () => {
  const c = clients[0]; // Ramón Batista, el cliente del recordatorio
  const msg = `Hello ${c.name.split(" ")[0]}, you have ${money(c.debt)} pending in Minisúper Doña Chela. See you soon!`;
  const phone = "507" + c.phone.replace("-", "");   // 507 = código de Panamá

  sentBtn.disabled = true;
  sentBtn.classList.add("sending");
  sentBtn.textContent = "Sending...";

  setTimeout(() => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    sentBtn.classList.remove("sending");
    sentBtn.classList.add("done");
    sentBtn.textContent = "Sent ✓";

    // Se queda en "Sent ✓" (el botón queda bloqueado)
  }, 800);
});

render();