import { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { api, getAuth } from "../api";

const CANCEL_WINDOW_MS = 15 * 60 * 1000;

export default function DashboardPage() {
  const auth = getAuth();

  if (auth.user.role === "admin") {
    return <AdminDashboard />;
  }

  if (auth.user.role === "seller") {
    return <SellerDashboard />;
  }

  return <CustomerDashboard />;
}

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedVegetable, setSelectedVegetable] = useState(null);
  const [error, setError] = useState("");

  async function loadAdminData() {
    try {
      const [summaryData, userData, vegetableData, orderData] = await Promise.all([
        api("/admin/summary"),
        api("/admin/users"),
        api("/admin/vegetables"),
        api("/admin/orders")
      ]);
      setSummary(summaryData);
      setUsers(userData);
      setVegetables(vegetableData);
      setOrders(orderData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function deleteUser(id) {
    setError("");
    try {
      await api(`/admin/users/${id}`, { method: "DELETE" });
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function editUser(user) {
    const name = window.prompt("Edit name", user.name);
    if (!name) return;
    const email = window.prompt("Edit email", user.email);
    if (!email) return;
    const role = window.prompt("Edit role (seller/customer/admin)", user.role);
    if (!role) return;
    const createdAt = window.prompt("Edit created date-time (ISO)", user.createdAt || "") || user.createdAt;

    setError("");
    try {
      await api(`/admin/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ name, email, role: role.toLowerCase(), createdAt })
      });
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteVegetable(id) {
    setError("");
    try {
      await api(`/admin/vegetables/${id}`, { method: "DELETE" });
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function editVegetable(veg) {
    const name = window.prompt("Edit vegetable name", veg.name);
    if (!name) return;
    const pricePerKg = window.prompt("Edit price per KG", String(veg.pricePerKg));
    if (pricePerKg == null) return;
    const quantityKg = window.prompt("Edit quantity KG", String(veg.quantityKg));
    if (quantityKg == null) return;
    const description = window.prompt("Edit description", veg.description || "") ?? "";
    const imageUrl = window.prompt("Edit image URL", veg.imageUrl || "") ?? "";
    const sellerId = window.prompt("Edit seller ID", veg.sellerId || "") ?? "";
    const createdAt = window.prompt("Edit created date-time (ISO)", veg.createdAt || "") || veg.createdAt;

    setError("");
    try {
      await api(`/admin/vegetables/${veg.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          pricePerKg: Number(pricePerKg),
          quantityKg: Number(quantityKg),
          description,
          imageUrl,
          sellerId,
          createdAt
        })
      });
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  function viewVegetable(veg) {
    setSelectedVegetable(veg);
  }

  async function deleteOrder(id) {
    setError("");
    try {
      await api(`/admin/orders/${id}`, { method: "DELETE" });
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function editOrder(order) {
    const status = window.prompt("Edit status (placed/canceled)", order.status || "placed");
    if (!status) return;
    const deliveryAddress = window.prompt("Edit delivery address", order.deliveryAddress || "");
    if (!deliveryAddress) return;
    const phoneNumber = window.prompt("Edit phone number", order.phoneNumber || "");
    if (!phoneNumber) return;
    const totalAmount = window.prompt("Edit total amount", String(order.totalAmount || 0));
    if (totalAmount == null) return;
    const customerId = window.prompt("Edit customer ID", order.customerId || "");
    if (!customerId) return;
    const createdAt = window.prompt("Edit created date-time (ISO)", order.createdAt || "") || order.createdAt;
    const itemsJson = window.prompt("Edit items JSON", JSON.stringify(order.items || []));
    if (itemsJson == null) return;

    setError("");
    try {
      const parsedItems = JSON.parse(itemsJson);
      await api(`/admin/orders/${order.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: status.toLowerCase(),
          deliveryAddress,
          phoneNumber,
          totalAmount: Number(totalAmount),
          customerId,
          createdAt,
          items: parsedItems
        })
      });
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  const sellers = users.filter((user) => user.role === "seller");
  const customers = users.filter((user) => user.role === "customer");
  const admins = users.filter((user) => user.role === "admin");
  const placedOrders = orders.filter((order) => order.status !== "canceled");
  const canceledOrders = orders.filter((order) => order.status === "canceled");

  return (
    <section className="reveal">
      <div className="hero-card">
        <h2>Admin Panel</h2>
        <p>Manage users, vegetables, and orders across the entire site.</p>
      </div>

      <nav className="tab-row">
        <NavLink to="/dashboard/admin-summary" className={({ isActive }) => `tab-link ${isActive ? "active" : ""}`}>Summary</NavLink>
        <NavLink to="/dashboard/admin-manage-users" className={({ isActive }) => `tab-link ${isActive ? "active" : ""}`}>Manage Users</NavLink>
        <NavLink to="/dashboard/admin-manage-sellers" className={({ isActive }) => `tab-link ${isActive ? "active" : ""}`}>Manage Sellers</NavLink>
        <NavLink to="/dashboard/admin-manage-customers" className={({ isActive }) => `tab-link ${isActive ? "active" : ""}`}>Manage Customers</NavLink>
        <NavLink to="/dashboard/admin-manage-admins" className={({ isActive }) => `tab-link ${isActive ? "active" : ""}`}>Manage Admins</NavLink>
        <NavLink to="/dashboard/admin-manage-vegetables" className={({ isActive }) => `tab-link ${isActive ? "active" : ""}`}>Manage Vegetables</NavLink>
        <NavLink to="/dashboard/admin-manage-orders" className={({ isActive }) => `tab-link ${isActive ? "active" : ""}`}>Manage Orders</NavLink>
        <NavLink to="/dashboard/admin-manage-placed-orders" className={({ isActive }) => `tab-link ${isActive ? "active" : ""}`}>Placed Orders</NavLink>
        <NavLink to="/dashboard/admin-manage-canceled-orders" className={({ isActive }) => `tab-link ${isActive ? "active" : ""}`}>Canceled Orders</NavLink>
      </nav>

      {error && <p className="error-text">{error}</p>}

      <Routes>
        <Route index element={<Navigate to="admin-summary" replace />} />
        <Route path="admin-summary" element={<AdminSummaryPage summary={summary} />} />
        <Route path="admin-manage-users" element={<AdminUsersTable title="Manage Users" users={users} onEdit={editUser} onDelete={deleteUser} />} />
        <Route path="admin-manage-sellers" element={<AdminUsersTable title="Manage Sellers" users={sellers} onEdit={editUser} onDelete={deleteUser} />} />
        <Route path="admin-manage-customers" element={<AdminUsersTable title="Manage Customers" users={customers} onEdit={editUser} onDelete={deleteUser} />} />
        <Route path="admin-manage-admins" element={<AdminUsersTable title="Manage Admins" users={admins} onEdit={editUser} onDelete={deleteUser} />} />
        <Route
          path="admin-manage-vegetables"
          element={
            <AdminVegetablesPage
              vegetables={vegetables}
              selectedVegetable={selectedVegetable}
              onView={viewVegetable}
              onEdit={editVegetable}
              onDelete={deleteVegetable}
            />
          }
        />
        <Route path="admin-manage-orders" element={<AdminOrdersPage title="Manage Orders" orders={orders} onEdit={editOrder} onDelete={deleteOrder} />} />
        <Route path="admin-manage-placed-orders" element={<AdminOrdersPage title="Manage Placed Orders" orders={placedOrders} onEdit={editOrder} onDelete={deleteOrder} />} />
        <Route path="admin-manage-canceled-orders" element={<AdminOrdersPage title="Manage Canceled Orders" orders={canceledOrders} onEdit={editOrder} onDelete={deleteOrder} />} />
        <Route path="*" element={<Navigate to="admin-summary" replace />} />
      </Routes>
    </section>
  );
}

function AdminSummaryPage({ summary }) {
  if (!summary) {
    return (
      <article className="card">
        <p className="muted">Loading summary...</p>
      </article>
    );
  }

  const cards = [
    { label: "Users", value: summary.users },
    { label: "Sellers", value: summary.sellers },
    { label: "Customers", value: summary.customers },
    { label: "Admins", value: summary.admins },
    { label: "Vegetables", value: summary.vegetables },
    { label: "Orders", value: summary.orders },
    { label: "Placed Orders", value: summary.placedOrders },
    { label: "Canceled Orders", value: summary.canceledOrders },
    { label: "Total Sales", value: `Rs ${summary.totalSales}` }
  ];

  return (
    <article className="card">
      <h3>Site Summary</h3>
      <ul className="veg-card-grid">
        {cards.map((card) => (
          <li key={card.label} className="veg-card">
            <strong>{card.label}</strong>
            <p className="price-text">{card.value}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function AdminUsersTable({ title, users, onEdit, onDelete }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      {users.length === 0 ? <p className="muted">No users found.</p> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="action-cell">
                    <button className="secondary-btn" onClick={() => onEdit(user)}>Edit</button>
                    <button className="danger-btn" onClick={() => onDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function AdminVegetablesPage({ vegetables, selectedVegetable, onView, onEdit, onDelete }) {
  return (
    <article className="card">
      <h3>Manage Vegetables</h3>
      {selectedVegetable && (
        <div className="card preview-card">
          <h3>Vegetable View</h3>
          {selectedVegetable.imageUrl && (
            <img className="veg-thumb large" src={selectedVegetable.imageUrl} alt={selectedVegetable.name} />
          )}
          <p><strong>Name:</strong> {selectedVegetable.name}</p>
          <p><strong>Seller:</strong> {selectedVegetable.sellerName}</p>
          <p><strong>Seller ID:</strong> {selectedVegetable.sellerId}</p>
          <p><strong>Price:</strong> Rs {selectedVegetable.pricePerKg}/kg</p>
          <p><strong>Quantity:</strong> {selectedVegetable.quantityKg} kg</p>
          <p><strong>Description:</strong> {selectedVegetable.description || "No description"}</p>
          <p><strong>Created At:</strong> {selectedVegetable.createdAt}</p>
          <p><strong>ID:</strong> {selectedVegetable.id}</p>
        </div>
      )}
      {vegetables.length === 0 ? <p className="muted">No vegetables found.</p> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Seller</th>
                <th>Price/KG</th>
                <th>Quantity</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vegetables.map((veg) => (
                <tr key={veg.id}>
                  <td>{veg.imageUrl ? <img className="veg-thumb tiny" src={veg.imageUrl} alt={veg.name} /> : "-"}</td>
                  <td>{veg.name}</td>
                  <td>{veg.sellerName}</td>
                  <td>Rs {veg.pricePerKg}</td>
                  <td>{veg.quantityKg} kg</td>
                  <td>{veg.description || "No description"}</td>
                  <td className="action-cell">
                    <button className="secondary-btn" onClick={() => onView(veg)}>View</button>
                    <button className="secondary-btn" onClick={() => onEdit(veg)}>Edit</button>
                    <button className="danger-btn" onClick={() => onDelete(veg.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function AdminOrdersPage({ title, orders, onEdit, onDelete }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      {orders.length === 0 ? <p className="muted">No orders found.</p> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Status</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>{order.customerName}</td>
                  <td>{order.items?.map((item) => `${item.name} (${item.quantityKg}kg)`).join(", ")}</td>
                  <td>{order.status === "canceled" ? "Canceled" : "Placed"}</td>
                  <td>{order.deliveryAddress || "-"}</td>
                  <td>{order.phoneNumber || "-"}</td>
                  <td>Rs {order.totalAmount}</td>
                  <td className="action-cell">
                    <button className="secondary-btn" onClick={() => onEdit(order)}>Edit</button>
                    <button className="danger-btn" onClick={() => onDelete(order.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function SellerDashboard() {
  const [myVegetables, setMyVegetables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  async function loadSellerData() {
    try {
      const [vegetables, orderData] = await Promise.all([api("/seller/vegetables"), api("/orders/me")]);
      setMyVegetables(vegetables);
      setOrders(orderData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadSellerData();
  }, []);

  async function createVegetable(payload) {
    await api("/vegetables", { method: "POST", body: JSON.stringify(payload) });
    await loadSellerData();
  }

  async function updateVegetable(id, payload) {
    await api(`/vegetables/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    await loadSellerData();
  }

  async function deleteVegetable(id) {
    await api(`/vegetables/${id}`, { method: "DELETE" });
    await loadSellerData();
  }

  async function hideOrder(id) {
    await api(`/orders/${id}`, { method: "DELETE" });
    await loadSellerData();
  }

  return (
    <section className="reveal">
      <div className="hero-card">
        <h2>Seller Dashboard</h2>
        <p>Manage your vegetables and monitor incoming customer orders.</p>
      </div>

      {error && <p className="error-text">{error}</p>}

      <Routes>
        <Route index element={<Navigate to="my-vegetables" replace />} />
        <Route
          path="my-vegetables"
          element={<MyVegetablesPage vegetables={myVegetables} />}
        />
        <Route
          path="manage-vegetables"
          element={
            <ManageVegetablesPage
              vegetables={myVegetables}
              onCreate={createVegetable}
              onUpdate={updateVegetable}
              onDelete={deleteVegetable}
            />
          }
        />
        <Route
          path="orders"
          element={<SellerOrdersPage orders={orders} onHide={hideOrder} />}
        />
        <Route path="*" element={<Navigate to="my-vegetables" replace />} />
      </Routes>
    </section>
  );
}

function MyVegetablesPage({ vegetables }) {
  return (
    <article className="card">
      <h3>My Vegetables</h3>
      {vegetables.length === 0 ? <p className="muted">No vegetables added yet.</p> : (
        <ul className="veg-card-grid">
          {vegetables.map((veg) => (
            <li key={veg.id} className="veg-card">
              {veg.imageUrl && <img className="veg-thumb large" src={veg.imageUrl} alt={veg.name} />}
              <strong>{veg.name}</strong>
              <p className="muted small">{veg.description || "No description"}</p>
              <p className="muted small">Rs {veg.pricePerKg}/kg</p>
              <p className="muted small">{veg.quantityKg} kg available</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function ManageVegetablesPage({ vegetables, onCreate, onUpdate, onDelete }) {
  const initialForm = { name: "", pricePerKg: "", quantityKg: "", description: "", imageUrl: "" };
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const payload = {
      ...form,
      pricePerKg: Number(form.pricePerKg),
      quantityKg: Number(form.quantityKg)
    };

    try {
      if (editingId) {
        await onUpdate(editingId, payload);
      } else {
        await onCreate(payload);
      }
      setForm(initialForm);
      setEditingId("");
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(veg) {
    setEditingId(veg.id);
    setForm({
      name: veg.name,
      pricePerKg: String(veg.pricePerKg),
      quantityKg: String(veg.quantityKg),
      description: veg.description || "",
      imageUrl: veg.imageUrl || ""
    });
  }

  async function remove(id) {
    setError("");
    try {
      await onDelete(id);
      if (editingId === id) {
        setEditingId("");
        setForm(initialForm);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid-two">
      <article className="card">
        <h3>{editingId ? "Edit Vegetable" : "Add Vegetable"}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input placeholder="Vegetable name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Price per KG" type="number" min="0" step="0.01" value={form.pricePerKg} onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })} required />
          <input placeholder="Quantity (KG)" type="number" min="0" step="0.01" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} required />
          <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {error && <p className="error-text">{error}</p>}
          <button className="primary-btn">{editingId ? "Update" : "Add"}</button>
          {editingId && (
            <button type="button" className="secondary-btn" onClick={() => { setEditingId(""); setForm(initialForm); }}>
              Cancel Edit
            </button>
          )}
        </form>
      </article>

      <article className="card">
        <h3>Manage List</h3>
        {vegetables.length === 0 ? <p className="muted">No vegetables found.</p> : (
          <ul className="list compact">
            {vegetables.map((veg) => (
              <li key={veg.id}>
                <div>
                  {veg.imageUrl && <img className="veg-thumb" src={veg.imageUrl} alt={veg.name} />}
                  <strong>{veg.name}</strong>
                  <p className="muted small">Rs {veg.pricePerKg}/kg | {veg.quantityKg} kg</p>
                </div>
                <button className="secondary-btn" onClick={() => startEdit(veg)}>Edit</button>
                <button className="danger-btn" onClick={() => remove(veg.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

function SellerOrdersPage({ orders, onHide }) {
  return (
    <article className="card">
      <h3>Orders</h3>
      {orders.length === 0 ? <p className="muted">No orders yet.</p> : (
        <ul className="list compact">
          {orders.map((order) => (
            <li key={order.id}>
              <div>
                <strong>{new Date(order.createdAt).toLocaleString()} - {order.customerName}</strong>
                <p className="muted small">
                  {order.sellerItems?.map((item) => `${item.name} (${item.quantityKg}kg)`).join(", ")}
                </p>
                <p className="muted small">Address: {order.deliveryAddress || "Not provided"}</p>
                <p className="muted small">Phone: {order.phoneNumber || "Not provided"}</p>
                <p className={`small ${order.status === "canceled" ? "error-text" : "muted"}`}>
                  Status: {order.status === "canceled" ? "Canceled" : "Placed"}
                </p>
              </div>
              <span>Rs {order.sellerAmount ?? order.totalAmount}</span>
              <button className="danger-btn" onClick={() => onHide(order.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function CustomerDashboard() {
  const [vegetables, setVegetables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [nowMs, setNowMs] = useState(Date.now());
  const [error, setError] = useState("");

  async function loadCustomerData() {
    try {
      const [allVegetables, myOrders] = await Promise.all([api("/vegetables"), api("/orders/me")]);
      setVegetables(allVegetables);
      setOrders(myOrders);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCustomerData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  async function placeOrder(payload) {
    await api("/orders", { method: "POST", body: JSON.stringify(payload) });
    await loadCustomerData();
  }

  async function cancelOrder(orderId) {
    await api(`/orders/${orderId}/cancel`, { method: "POST" });
    await loadCustomerData();
  }

  async function hideOrder(orderId) {
    await api(`/orders/${orderId}`, { method: "DELETE" });
    await loadCustomerData();
  }

  return (
    <section className="reveal">
      <div className="hero-card">
        <h2>Customer Dashboard</h2>
        <p> Fresh vegetables from local sellers to your home..</p>
      </div>

      {error && <p className="error-text">{error}</p>}

      <Routes>
        <Route index element={<Navigate to="vegetables-available" replace />} />
        <Route
          path="vegetables-available"
          element={<VegetablesAvailablePage vegetables={vegetables} />}
        />
        <Route
          path="buy/:vegetableId"
          element={<BuyPage vegetables={vegetables} onBuy={placeOrder} onError={setError} />}
        />
        <Route
          path="my-orders"
          element={
            <MyOrdersPage
              orders={orders}
              nowMs={nowMs}
              onCancel={cancelOrder}
              onHide={hideOrder}
              onError={setError}
            />
          }
        />
        <Route path="*" element={<Navigate to="vegetables-available" replace />} />
      </Routes>
    </section>
  );
}

function VegetablesAvailablePage({ vegetables }) {
  return (
    <article className="card">
      <h3>Vegetables Available</h3>
      {vegetables.length === 0 ? <p className="muted">No vegetables available right now.</p> : (
        <ul className="veg-card-grid">
          {vegetables.map((veg) => (
            <li key={veg.id} className="veg-card">
              {veg.imageUrl && <img className="veg-thumb large" src={veg.imageUrl} alt={veg.name} />}
              <strong>{veg.name}</strong>
              <p className="muted small">{veg.description || "No description"}</p>
              <p className="muted small">Seller: {veg.sellerName}</p>
              <p className="muted small">Rs {veg.pricePerKg}/kg</p>
              <p className="muted small">{veg.quantityKg} kg available</p>
              <NavLink to={`/dashboard/buy/${veg.id}`} className="primary-btn">Buy</NavLink>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function BuyPage({ vegetables, onBuy, onError }) {
  const { vegetableId } = useParams();
  const navigate = useNavigate();
  const vegetable = useMemo(() => vegetables.find((item) => item.id === vegetableId), [vegetables, vegetableId]);
  const [quantityKg, setQuantityKg] = useState("1");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  if (!vegetable) {
    return (
      <article className="card">
        <p className="muted">Vegetable not found.</p>
      </article>
    );
  }

  const total = Number(quantityKg || 0) * Number(vegetable.pricePerKg || 0);

  async function submit(event) {
    event.preventDefault();
    onError("");

    if (!deliveryAddress.trim() || !phoneNumber.trim() || Number(quantityKg) <= 0) {
      onError("Enter valid quantity, address, and phone number.");
      return;
    }

    setLoading(true);
    try {
      await onBuy({
        items: [{ vegetableId: vegetable.id, quantityKg: Number(quantityKg) }],
        deliveryAddress,
        phoneNumber
      });
      navigate("/dashboard/my-orders");
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="card">
      <h3>Buying Page</h3>
      <p><strong>{vegetable.name}</strong></p>
      {vegetable.imageUrl && <img className="veg-thumb large buy-image" src={vegetable.imageUrl} alt={vegetable.name} />}
      <p className="muted">Price: Rs {vegetable.pricePerKg}/kg</p>
      <form className="form-grid" onSubmit={submit}>
        <label htmlFor="quantityKg">How much quantity do you want to order? (KG)</label>
        <input id="quantityKg" type="number" min="0.5" step="0.5" value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} required />
        <textarea placeholder="Delivery address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required />
        <input type="tel" placeholder="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        <p className="price-text">Total: Rs {total.toFixed(2)}</p>
        <button className="primary-btn" disabled={loading}>{loading ? "Placing order..." : "Confirm Buy"}</button>
      </form>
    </article>
  );
}

function MyOrdersPage({ orders, nowMs, onCancel, onHide, onError }) {
  function canCancelOrder(order) {
    if (order.status === "canceled") {
      return false;
    }
    const createdAt = new Date(order.createdAt).getTime();
    if (Number.isNaN(createdAt)) {
      return false;
    }
    return nowMs - createdAt <= CANCEL_WINDOW_MS;
  }

  async function cancel(id) {
    onError("");
    try {
      await onCancel(id);
    } catch (err) {
      onError(err.message);
    }
  }

  async function hide(id) {
    onError("");
    try {
      await onHide(id);
    } catch (err) {
      onError(err.message);
    }
  }

  return (
    <article className="card">
      <h3>My Orders</h3>
      {orders.length === 0 ? <p className="muted">You have no orders yet.</p> : (
        <ul className="list compact">
          {orders.map((order) => {
            const canCancel = canCancelOrder(order);
            return (
              <li key={order.id}>
                <div>
                  <strong>{new Date(order.createdAt).toLocaleString()}</strong>
                  <div className="order-item-list">
                    {order.items?.map((item, idx) => (
                      <div key={`${order.id}-${item.vegetableId}-${idx}`} className="order-item-row">
                        {item.imageUrl && <img className="veg-thumb tiny" src={item.imageUrl} alt={item.name} />}
                        <p className="muted small">{item.name} ({item.quantityKg}kg)</p>
                      </div>
                    ))}
                  </div>
                  <p className={`small ${order.status === "canceled" ? "error-text" : "muted"}`}>
                    Status: {order.status === "canceled" ? "Canceled" : "Placed"}
                  </p>
                </div>
                <span>Rs {order.totalAmount}</span>
                <button className="secondary-btn" onClick={() => cancel(order.id)} disabled={!canCancel}>
                  {order.status === "canceled" ? "Canceled" : (canCancel ? "Cancel Order" : "Cancel Expired")}
                </button>
                <button className="danger-btn" onClick={() => hide(order.id)}>Delete</button>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
