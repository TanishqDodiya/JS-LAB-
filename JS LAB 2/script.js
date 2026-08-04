const GST_RATE = 0.18;
const STORAGE_KEY = "invoiceBillingHistory";

const customerNameInput = document.getElementById("customerName");
const invoiceDateInput = document.getElementById("invoiceDate");
const productNameInput = document.getElementById("productName");
const rateInput = document.getElementById("rate");
const quantityInput = document.getElementById("quantity");
const discountInput = document.getElementById("discount");
const addItemBtn = document.getElementById("addItemBtn");
const generateBillBtn = document.getElementById("generateBillBtn");
const printBtn = document.getElementById("printBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const formMessage = document.getElementById("formMessage");

const itemsTableBody = document.getElementById("itemsTableBody");
const previewTableBody = document.getElementById("previewTableBody");
const subtotalEl = document.getElementById("subtotal");
const totalDiscountEl = document.getElementById("totalDiscount");
const totalGstEl = document.getElementById("totalGst");
const grandTotalEl = document.getElementById("grandTotal");
const previewCustomerName = document.getElementById("previewCustomerName");
const previewDate = document.getElementById("previewDate");
const previewSubtotal = document.getElementById("previewSubtotal");
const previewDiscount = document.getElementById("previewDiscount");
const previewGst = document.getElementById("previewGst");
const previewGrandTotal = document.getElementById("previewGrandTotal");
const historyList = document.getElementById("historyList");

let items = [];
let history = loadHistory();

setDefaultDate();
renderItems();
renderSummary();
renderPreview([], null);
renderHistory();

addItemBtn.addEventListener("click", addItem);
generateBillBtn.addEventListener("click", generateInvoice);
printBtn.addEventListener("click", () => window.print());
clearHistoryBtn.addEventListener("click", clearHistory);

function setMessage(message, isError = false) {
  formMessage.textContent = message;
  if (isError) {
    formMessage.style.color = "#ff6b6b";
  } else {
    formMessage.style.color = "#666666";
  }
}

function setDefaultDate() {
  const today = new Date();
  const localDate = today.toISOString().split("T")[0];
  invoiceDateInput.value = localDate;
}

function formatCurrency(value) {
  return `₹${Number(value).toFixed(2)}`;
}

function parseNumber(value) {
  return Number.parseFloat(value);
}

function validateCustomerDetails() {
  const customerName = customerNameInput.value.trim();
  const invoiceDate = invoiceDateInput.value;

  if (!customerName) {
    setMessage("Please enter the customer name.", true);
    customerNameInput.focus();
    return false;
  }

  if (!invoiceDate) {
    setMessage("Please select an invoice date.", true);
    invoiceDateInput.focus();
    return false;
  }

  return true;
}

function validateItem() {
  const productName = productNameInput.value.trim();
  const rate = parseNumber(rateInput.value);
  const quantity = parseNumber(quantityInput.value);
  let discountValue = discountInput.value.trim();
  let discount;

  if (discountValue === "") {
    discount = 0;
  } else {
    discount = parseNumber(discountValue);
  }

  if (!productName) {
    setMessage("Please enter a product name.", true);
    productNameInput.focus();
    return null;
  }

  if (!Number.isFinite(rate)) {
    setMessage("Please enter a valid rate greater than 0.", true);
    rateInput.focus();
    return null;
  } else {
    if (rate <= 0) {
      setMessage("Please enter a valid rate greater than 0.", true);
      rateInput.focus();
      return null;
    } else {
      if (!Number.isFinite(quantity)) {
        setMessage("Please enter a valid quantity greater than 0.", true);
        quantityInput.focus();
        return null;
      } else {
        if (quantity <= 0) {
          setMessage("Please enter a valid quantity greater than 0.", true);
          quantityInput.focus();
          return null;
        } else {
          if (!Number.isFinite(discount)) {
            setMessage("Discount must be between 0 and 100.", true);
            discountInput.focus();
            return null;
          } else {
            if (discount < 0) {
              setMessage("Discount must be between 0 and 100.", true);
              discountInput.focus();
              return null;
            } else {
              if (discount > 100) {
                setMessage("Discount must be between 0 and 100.", true);
                discountInput.focus();
                return null;
              }
            }
          }
        }
      }
    }
  }

  return {
    productName,
    rate,
    quantity,
    discount,
  };
}

function calculateItemTotals(item) {
  const lineTotal = item.rate * item.quantity;
  const discountAmount = lineTotal * (item.discount / 100);
  const taxableAmount = Math.max(lineTotal - discountAmount, 0);
  const gstAmount = taxableAmount * GST_RATE;
  const totalAmount = taxableAmount + gstAmount;

  return {
    lineTotal,
    discountAmount,
    gstAmount,
    totalAmount,
  };
}

function addItem() {
  if (!validateCustomerDetails()) {
    return;
  }

  const item = validateItem();
  if (!item) {
    return;
  }

  items.push(item);
  productNameInput.value = "";
  rateInput.value = "";
  quantityInput.value = "";
  discountInput.value = "";
  productNameInput.focus();
  setMessage("Item added successfully.");
  renderItems();
  renderSummary();
}

function removeItem(index) {
  items.splice(index, 1);
  renderItems();
  renderSummary();
  setMessage("Item removed.");
}

function renderItems() {
  if (items.length === 0) {
    itemsTableBody.innerHTML = '<tr class="empty-row"><td colspan="7">No items added yet.</td></tr>';
    return;
  }

  itemsTableBody.innerHTML = items
    .map((item, index) => {
      const totals = calculateItemTotals(item);
      return `
        <tr>
          <td>${escapeHtml(item.productName)}</td>
          <td>${formatCurrency(item.rate)}</td>
          <td>${item.quantity}</td>
          <td>${item.discount.toFixed(2)}%</td>
          <td>${formatCurrency(totals.gstAmount)}</td>
          <td>${formatCurrency(totals.totalAmount)}</td>
          <td><button class="remove-btn" type="button" data-index="${index}">Remove</button></td>
        </tr>
      `;
    })
    .join("");

  itemsTableBody.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = Number(event.currentTarget.dataset.index);
      removeItem(index);
    });
  });
}

function calculateTotals() {
  return items.reduce(
    (accumulator, item) => {
      const totals = calculateItemTotals(item);
      accumulator.subtotal += totals.lineTotal;
      accumulator.discount += totals.discountAmount;
      accumulator.gst += totals.gstAmount;
      accumulator.grandTotal += totals.totalAmount;
      return accumulator;
    },
    { subtotal: 0, discount: 0, gst: 0, grandTotal: 0 }
  );
}

function renderSummary() {
  const totals = calculateTotals();
  subtotalEl.textContent = formatCurrency(totals.subtotal);
  totalDiscountEl.textContent = formatCurrency(totals.discount);
  totalGstEl.textContent = formatCurrency(totals.gst);
  grandTotalEl.textContent = formatCurrency(totals.grandTotal);
}

function renderPreview(invoiceItems, customer) {
  if (!customer) {
    previewCustomerName.textContent = "Customer Name";
    previewDate.textContent = "Date will appear here";
  } else {
    previewCustomerName.textContent = customer.name;
    previewDate.textContent = customer.date;
  }

  if (invoiceItems.length === 0) {
    previewTableBody.innerHTML = '<tr class="empty-row"><td colspan="6">Generate an invoice to see the preview.</td></tr>';
    previewSubtotal.textContent = formatCurrency(0);
    previewDiscount.textContent = formatCurrency(0);
    previewGst.textContent = formatCurrency(0);
    previewGrandTotal.textContent = formatCurrency(0);
    return;
  }

  previewTableBody.innerHTML = invoiceItems
    .map((item) => {
      const totals = calculateItemTotals(item);
      return `
        <tr>
          <td>${escapeHtml(item.productName)}</td>
          <td>${formatCurrency(item.rate)}</td>
          <td>${item.quantity}</td>
          <td>${item.discount.toFixed(2)}%</td>
          <td>${formatCurrency(totals.gstAmount)}</td>
          <td>${formatCurrency(totals.totalAmount)}</td>
        </tr>
      `;
    })
    .join("");

  const totals = invoiceItems.reduce(
    (accumulator, item) => {
      const lineTotals = calculateItemTotals(item);
      accumulator.subtotal += lineTotals.lineTotal;
      accumulator.discount += lineTotals.discountAmount;
      accumulator.gst += lineTotals.gstAmount;
      accumulator.grandTotal += lineTotals.totalAmount;
      return accumulator;
    },
    { subtotal: 0, discount: 0, gst: 0, grandTotal: 0 }
  );

  previewSubtotal.textContent = formatCurrency(totals.subtotal);
  previewDiscount.textContent = formatCurrency(totals.discount);
  previewGst.textContent = formatCurrency(totals.gst);
  previewGrandTotal.textContent = formatCurrency(totals.grandTotal);
}

function generateInvoice() {
  if (!validateCustomerDetails()) {
    return;
  }

  if (items.length === 0) {
    setMessage("Add at least one item before generating the bill.", true);
    return;
  }

  const customer = {
    name: customerNameInput.value.trim(),
    date: invoiceDateInput.value,
    displayDate: formatDisplayDate(invoiceDateInput.value),
  };
  const totals = calculateTotals();
  const invoice = {
    id: Date.now(),
    customer,
    items: items.map((item) => ({ ...item })),
    totals,
    createdAt: new Date().toISOString(),
  };

  renderPreview(invoice.items, customer);
  history.unshift(invoice);
  saveHistory();
  renderHistory();
  setMessage("Invoice generated and saved to history.");
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = '<div class="history-empty">No saved invoices yet.</div>';
    return;
  }

  historyList.innerHTML = history
    .map((invoice) => {
      let displayDate = invoice.customer.displayDate;

      if (!displayDate) {
        displayDate = formatDisplayDate(invoice.customer.date);
      }

      return `
        <article class="history-item">
          <div>
            <h4>${escapeHtml(invoice.customer.name)}</h4>
            <p>${escapeHtml(displayDate)} • ${invoice.items.length} item(s)</p>
          </div>
          <div class="history-actions">
            <div>
              <strong>${formatCurrency(invoice.totals.grandTotal)}</strong>
              <p>Grand total</p>
            </div>
            <button class="btn primary load-invoice-btn" type="button" data-id="${invoice.id}">View</button>
          </div>
        </article>
      `;
    })
    .join("");

  historyList.querySelectorAll(".load-invoice-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const invoiceId = Number(event.currentTarget.dataset.id);
      const selectedInvoice = history.find((invoice) => invoice.id === invoiceId);
      if (selectedInvoice) {
        loadInvoice(selectedInvoice);
      }
    });
  });
}

function loadInvoice(invoice) {
  customerNameInput.value = invoice.customer.name;
  invoiceDateInput.value = invoice.customer.date;
  items = invoice.items.map((item) => ({ ...item }));
  renderItems();
  renderSummary();
  renderPreview(items, invoice.customer);
  setMessage("Invoice loaded from history.");
}

function clearHistory() {
  history = [];
  saveHistory();
  renderHistory();
  setMessage("Invoice history cleared.");
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function loadHistory() {
  try {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      return JSON.parse(savedHistory);
    } else {
      return [];
    }
  } catch {
    return [];
  }
}

function formatDisplayDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
