// Elements
const userTypeInputs = document.getElementsByName("userType");
const form = document.getElementById("incomeForm");
const entriesTableBody = document.querySelector("#entriesTable tbody");

const entryTitle = document.getElementById("entryTitle");
const platformField = document.getElementById("platformField");
const paymentMethodField = document.getElementById("paymentMethodField");
const amount = document.getElementById("amount");
const date = document.getElementById("date");
const status = document.getElementById("status");
const notes = document.getElementById("notes");

// Helpers
const getEntries = () => JSON.parse(localStorage.getItem("sidetrackr_entries")) || [];
const saveEntries = (entries) => localStorage.setItem("sidetrackr_entries", JSON.stringify(entries));

// Handle user type switching
userTypeInputs.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.value === "online") {
      platformField.style.display = "block";
      paymentMethodField.style.display = "none";
    } else {
      platformField.style.display = "none";
      paymentMethodField.style.display = "block";
    }
  });
});

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const selectedUserType = document.querySelector('input[name="userType"]:checked').value;

  const entry = {
    title: entryTitle.value.trim(),
    amount: parseFloat(amount.value),
    date: date.value || new Date().toISOString().split("T")[0],
    source: selectedUserType === "online"
      ? platformField.value.trim()
      : paymentMethodField.value.trim(),
    status: status.value,
    notes: notes.value.trim(),
    id: Date.now()
  };

  const entries = getEntries();
  entries.push(entry);
  saveEntries(entries);
  renderTable();
  form.reset();
});

// Render table
function renderTable() {
  const entries = getEntries();
  entriesTableBody.innerHTML = "";

  if (entries.length === 0) {
    entriesTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888;">No entries yet.</td></tr>`;
    return;
  }

  entries.forEach((entry) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${entry.title}</td>
      <td>${formatCurrency(entry.amount)}</td>
      <td>${entry.source || "-"}</td>
      <td>${capitalize(entry.status)}</td>
      <td>${formatDate(entry.date)}</td>
      <td>${entry.notes || "-"}</td>
      <td><button onclick="deleteEntry(${entry.id})" title="Delete">×</button></td>
    `;

    entriesTableBody.appendChild(tr);
  });
}

// Delete entry
function deleteEntry(id) {
  const entries = getEntries().filter((entry) => entry.id !== id);
  saveEntries(entries);
  renderTable();
}

// Helpers
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatCurrency(amount) {
  if (isNaN(amount)) return "-";
  return amount >= 100 ? `Ksh ${amount.toLocaleString()}` : `$${amount}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Load existing entries on startup
renderTable();

document.getElementById("exportCSV").addEventListener("click", () => {
  const entries = getEntries();
  if (!entries.length) {
    alert("No entries to export.");
    return;
  }

  const headers = ["Title", "Amount", "Source", "Status", "Date", "Notes"];
  const csvRows = [
    headers.join(","),
    ...entries.map(entry =>
      [
        `"${entry.title}"`,
        entry.amount,
        `"${entry.source}"`,
        `"${entry.status}"`,
        `"${entry.date}"`,
        `"${entry.notes}"`
      ].join(",")
    )
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "income_entries.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

