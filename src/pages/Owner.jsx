import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import Chart from "chart.js/auto";

export default function Owner() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(""); // ✅ SEARCH ADDED

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  async function loadProducts() {
    const res = await fetch(API + "/products");
    const data = await res.json();
    setProducts(data);
  }

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

  function drawChart(data) {
    const categories = {};

    data.forEach((p) => {
      const qty = Number(p.quantity || 0);
      categories[p.category] = (categories[p.category] || 0) + qty;
    });

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(categories),
        datasets: [
          {
            label: "Stock",
            data: Object.values(categories),
            backgroundColor: "#556b2f",
          },
        ],
      },
    });
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      drawChart(products);
    }
  }, [products]);

  const lowStock = products.filter((p) => Number(p.quantity || 0) <= 5);

  // ✅ SEARCH FILTER LOGIC
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="d-flex">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h4 className="text-center mb-4">Owner</h4>

        <button onClick={() => window.open(API + "/report")}>
          📄 Download PDF
        </button>

        <button onClick={() => window.location.href = "/"}>
          🚪 Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="main-content">

        <h2>Stock Overview</h2>

        {/* SEARCH BAR ✅ */}
        <div className="card mb-3">
          <input
            className="search"
            placeholder="🔍 Search by name, code, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LOW STOCK SECTION */}
        <div className="card mb-3">
          <h5>⚠ Low Stock Alerts</h5>

          <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
            {lowStock.map((p) => (
              <div
                key={p.id}
                className={`status-box ${getStatusClass(p.quantity)}`}
              >
                <strong>{p.name}</strong> — Qty: {p.quantity}
              </div>
            ))}
          </div>
        </div>

        {/* CHART */}
        <div className="card mb-3">
          <h5>Stock Analytics</h5>
          <canvas ref={chartRef} height="100"></canvas>
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
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.code}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(p.quantity)}`}>
                      {getStockStatus(p.quantity)}
                    </span>
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