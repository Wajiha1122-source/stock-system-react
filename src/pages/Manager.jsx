import API from "../services/api";
import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

export default function Manager() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [editId, setEditId] = useState(null);

  // ✅ FILTER STATES
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // ✅ NEW REF FOR AUTO SCROLL
  const formRef = useRef(null);

  async function loadProducts() {
    const res = await fetch(API + "/products");
    const data = await res.json();

    setAllProducts(data);
    setProducts(data);
    setEditId(null);
    clearForm();
  }

  /* ---------------- ADD / UPDATE ---------------- */
  async function addProduct() {
    const product = {
      code: document.getElementById("code").value,
      name: document.getElementById("name").value,
      category: document.getElementById("category").value,
      details: document.getElementById("details").value,
      unit: document.getElementById("unit").value,
      quantity: Number(document.getElementById("quantity").value),
      price: Number(document.getElementById("price").value)
    };

    if (editId) {
      await fetch(API + "/products/" + editId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
      setEditId(null);
    } else {
      await fetch(API + "/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
    }

    loadProducts();
    clearForm();
  }

  function clearForm() {
    document.getElementById("code").value = "";
    document.getElementById("name").value = "";
    document.getElementById("category").value = "";
    document.getElementById("details").value = "";
    document.getElementById("unit").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("price").value = "";
  }

  /* ---------------- EDIT ---------------- */
  function editProduct(p) {
    document.getElementById("code").value = p.code;
    document.getElementById("name").value = p.name;
    document.getElementById("category").value = p.category;
    document.getElementById("details").value = p.details;
    document.getElementById("unit").value = p.unit;
    document.getElementById("quantity").value = p.quantity;
    document.getElementById("price").value = p.price;

    setEditId(p.id);

    // ✅ AUTO SCROLL TO FORM
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  /* ---------------- DELETE ---------------- */
  async function deleteProduct(id) {
    await fetch(API + "/products/" + id, {
      method: "DELETE"
    });

    loadProducts();
  }

  /* ---------------- STATUS ---------------- */
  function getStockStatus(qty) {
    qty = Number(qty || 0);

    if (qty < 0) return "URGENT REQUIRED";
    if (qty === 0) return "OUT";
    if (qty <= 5) return "LOW";
    return "OK";
  }

  function getStatusClass(qty) {
    qty = Number(qty || 0);

    if (qty < 0) return "status-urgent";
    if (qty === 0) return "status-out";
    if (qty <= 5) return "status-low";
    return "status-ok";
  }

  /* ---------------- FILTERS ---------------- */
  function handleFilters(searchValue, categoryValue, statusValue) {

    let filtered = [...allProducts];

    // SEARCH
    if (searchValue) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.code.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.category.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // CATEGORY FILTER
    if (categoryValue !== "All") {
      filtered = filtered.filter(
        p => p.category === categoryValue
      );
    }

    // STATUS FILTER
    if (statusValue !== "All") {
      filtered = filtered.filter(
        p => getStockStatus(p.quantity) === statusValue
      );
    }

    setProducts(filtered);
  }

  /* ---------------- CHART ---------------- */
  function drawChart(data) {
    const categories = {};

    data.forEach(p => {
      const qty = Number(p.quantity || 0);
      categories[p.category] = (categories[p.category] || 0) + qty;
    });

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(categories),
        datasets: [{
          label: "Stock",
          data: Object.values(categories),
          backgroundColor: "#6b8e23"
        }]
      }
    });
  }

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      drawChart(products);
    }
  }, [products]);

  /* ---------------- SAFE TOTALS ---------------- */
  const totalQty = products.reduce((sum, p) => {
    const qty = Number(p.quantity || 0);
    return sum + (qty > 0 ? qty : 0);
  }, 0);

  const totalValue = products.reduce((sum, p) => {
    const qty = Number(p.quantity || 0);
    const price = Number(p.price || 0);
    return sum + (qty > 0 ? qty * price : 0);
  }, 0);

  // ✅ CATEGORY LIST
  const categories = [
    "All",
    ...new Set(allProducts.map(p => p.category))
  ];

  return (
    <div>

      {/* SIDEBAR */}
      <div className="sidebar">
        <h4 className="text-center mb-4">Manager</h4>

        <button
          onClick={() => {
            setEditId(null);
            setProducts(allProducts);
            loadProducts();
            clearForm();

            setSearch("");
            setSelectedCategory("All");
            setSelectedStatus("All");
          }}
        >
          🔄 Refresh
        </button>

        <button onClick={() => window.open(API + "/report")}>
          📄 Download PDF
        </button>

        <button onClick={() => (window.location.href = "/")}>
          🚪 Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="main-content">

        <h2>Product Management</h2>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
            marginBottom: "20px"
          }}
        >
          <div className="card p-3 text-center">
            <h6>Total Products</h6>
            <h4>{products.length}</h4>
          </div>

          <div className="card p-3 text-center">
            <h6>Total Quantity</h6>
            <h4>{totalQty}</h4>
          </div>

          <div className="card p-3 text-center">
            <h6>Total Value</h6>
            <h4>{totalValue}</h4>
          </div>

          <div className="card p-3 text-center">
            <h6>Categories</h6>
            <h4>{[...new Set(products.map(p => p.category))].length}</h4>
          </div>
        </div>

        {/* CHART */}
        <div className="card p-3 mb-4">
          <h5>Stock Analytics</h5>
          <canvas ref={chartRef} height="100"></canvas>
        </div>

        {/* ADD PRODUCT */}
        <div className="card p-3 mb-3" ref={formRef}>

          <h5 className="mb-3">
            {editId ? "Edit Product" : "Add Product"}
          </h5>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "10px"
            }}
          >
            <input id="code" placeholder="Code" />
            <input id="name" placeholder="Name" />
            <input id="category" placeholder="Category" />
            <input id="details" placeholder="Details" />
            <input id="unit" placeholder="Unit" />
            <input id="quantity" placeholder="Qty" />
            <input id="price" placeholder="Price" />

            <div style={{ gridColumn: "1 / -1" }}>
              <button onClick={addProduct} style={{ width: "100%" }}>
                {editId ? "Update Product" : "Save Product"}
              </button>
            </div>

          </div>
        </div>

        {/* SEARCH + FILTERS */}
        <div
          className="card p-3 mb-3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
            alignItems: "center"
          }}
        >

          {/* SEARCH */}
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);

              handleFilters(
                value,
                selectedCategory,
                selectedStatus
              );
            }}
          />

          {/* CATEGORY FILTER */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCategory(value);

              handleFilters(
                search,
                value,
                selectedStatus
              );
            }}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd"
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* STATUS FILTER */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedStatus(value);

              handleFilters(
                search,
                selectedCategory,
                value
              );
            }}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd"
            }}
          >
            <option value="All">All Status</option>
            <option value="OK">OK</option>
            <option value="LOW">LOW</option>
            <option value="OUT">OUT</option>
            <option value="URGENT REQUIRED">URGENT REQUIRED</option>
          </select>

        </div>

        {/* TABLE */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.code}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.quantity}</td>
                  <td>{p.price}</td>

                  <td>
                    <span
                      className={`status-badge ${getStatusClass(p.quantity)}`}
                      style={{
                        display: "inline-block",
                        minWidth: "70px",
                        textAlign: "center"
                      }}
                    >
                      {getStockStatus(p.quantity)}
                    </span>
                  </td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap"
                      }}
                    >
                      <button onClick={() => editProduct(p)}>
                        Edit
                      </button>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        style={{ background: "red" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}