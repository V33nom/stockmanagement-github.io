// LocalStorage DB
let db = JSON.parse(localStorage.getItem("jewelleryDB")) || { users: [], items: [], transactions: [] };
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let chartInstance = null;

function saveDB() {
  localStorage.setItem("jewelleryDB", JSON.stringify(db));
}

function showDashboard() {
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("reportsPage").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  renderStock();
  renderStats();
}

function showAuth() {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("reportsPage").classList.add("hidden");
  document.getElementById("authPage").classList.remove("hidden");
}

function showReports() {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("reportsPage").classList.remove("hidden");
  renderReport();
}

// Auth
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (db.users.find(u => u.email === email)) {
    document.getElementById("authMsg").innerText = "User already exists!";
    return;
  }
  let newUser = { id: "JWL-" + (db.users.length + 1), email, password };
  db.users.push(newUser);
  saveDB();
  document.getElementById("authMsg").innerText = "Registered! Please login.";
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  let user = db.users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    showDashboard();
  } else {
    document.getElementById("authMsg").innerText = "Invalid credentials!";
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  showAuth();
}

// Stock Management
function addItem() {
  let name = document.getElementById("itemName").value;
  let qty = parseInt(document.getElementById("quantity").value);
  let category = document.getElementById("category").value;
  let netweight = document.getElementById("Net-weight").value;
  let grossweight = document.getElementById("gross-weight").value;
  let carat = document.getElementById("carat").value;
  let dateAdded = new Date().toLocaleDateString();

 

  let item = {
    id: "ITM-" + (db.items.length + 1),
    name,
    stock: qty,
    category,
    netweight,
    grossweight,
    carat,
    dateAdded
  };

  db.items.push(item);
  saveDB();
  renderStock();
  renderStats();

  // reset inputs
  document.getElementById("itemName").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("Net-weight").value = "";
  document.getElementById("gross-weight").value = "";
}
function renderStock() {
  let table = document.getElementById("stockTable");
  table.innerHTML = "";
  db.items.forEach(item => {
    table.innerHTML += `
      <tr>
        <td class="p-2">${item.name}</td>
        <td class="p-2">${item.stock}</td>
        
        <td class="p-2">${item.netweight}</td>
        <td class="p-2">${item.grossweight}</td>
        <td class="p-2">${item.category}</td> <!-- ✅ show category -->
        <td class="p-2">${item.carat}</td> <!-- ✅ show carat -->
        <td class="p-2">${item.dateAdded}</td> <!-- ✅ show date added -->
        <td class="p-2">
          <button onclick="sellItem('${item.id}')" class="btn btn-primary">Sell</button>
          <button onclick="deleteItem('${item.id}')" class="btn btn-danger">Delete</button>
        </td>
      </tr>
    `;
  });
}
// Fill Carat dropdown based on category
function updateCaratOptions() {
  let category = document.getElementById("category").value;
  let caratSelect = document.getElementById("carat");
  caratSelect.innerHTML = ""; // reset

  let options = [];
  if (category === "Gold") {
    options = ["24 Carat", "22 Carat", "18 Carat"];
  } else if (category === "Silver") {
    options = ["999", "958", "925", "900", "800"];
  } else if (category === "Diamond") {
    options = ["VVS1", "VVS2", "VS1", "VS2"];
  }

  options.forEach(opt => {
    let optionEl = document.createElement("option");
    optionEl.value = opt;
    optionEl.textContent = opt;
    caratSelect.appendChild(optionEl);
  });
}
// Initial call to set carat options

function sellItem(id) {
  let item = db.items.find(i => i.id === id);
  if (item && item.stock > 0) {
    item.stock--;
    db.transactions.push({ id: "TX-" + (db.transactions.length + 1), itemId: id, type: "sale", date: new Date() });
    saveDB();
    renderStock();
    renderStats();
  }
}

function deleteItem(id) {
  let itemIndex = db.items.findIndex(i => i.id === id);
  if (itemIndex > -1 && db.items[itemIndex].stock === 0) {
    db.items.splice(itemIndex, 1);
    saveDB();
    renderStock();
    renderStats();
  }
}

function renderStats() {
  document.getElementById("totalItems").innerText = db.items.length;
  let sales = db.transactions.filter(t => t.type === "sale").length;
  document.getElementById("totalSales").innerText = sales;
  let revenue = db.transactions.reduce((sum, t) => {
    let item = db.items.find(i => i.id === t.itemId);
    return sum + (item ? item.sellingPrice : 0);
  }, 0);
  document.getElementById("totalRevenue").innerText = "₹" + revenue;
}

// Reports
function renderReport() {
  let monthlySales = {};
  db.transactions.forEach(t => {
    let date = new Date(t.date);
    let month = date.toLocaleString("default", { month: "short", year: "numeric" });
    monthlySales[month] = (monthlySales[month] || 0) + 1;
  });

  let labels = Object.keys(monthlySales);
  let values = Object.values(monthlySales);

  let ctx = document.getElementById("salesChart").getContext("2d");

  if (chartInstance) chartInstance.destroy(); // reset if chart exists

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Sales",
        data: values,
        backgroundColor: "#2563eb"
      }]
    }
  });
}

// Init
if (currentUser) {
  showDashboard();
} else {
  showAuth();
}


