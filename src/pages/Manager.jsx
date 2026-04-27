import API from "../services/api";
import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";



export default function Manager() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [editId, setEditId] = useState(null);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);


async function loadProducts() {
  const res = await fetch(API + "/products");
  const data = await res.json();

  setAllProducts(data);
  setProducts(data);
  setEditId(null);   // 🔥 important
  clearForm();       // 🔥 ensures UI reset
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

  /* ---------------- SEARCH ---------------- */
 function handleSearch(value) {
  const v = value.toLowerCase();

  if (!v) {
    setProducts(allProducts);
    return;
  }

  setProducts(
    allProducts.filter(p =>
      p.name.toLowerCase().includes(v) ||
      p.code.toLowerCase().includes(v) ||
      p.category.toLowerCase().includes(v)
    )
  );
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
  }}
>
  🔄 Refresh
</button>
        <button onClick={() => window.open(API + "/report")}>📄 Download PDF</button>
        <button onClick={() => (window.location.href = "/")}>🚪 Logout</button>
      </div>

      {/* MAIN */}
      <div className="main-content">

        <h2>Product Management</h2>

        {/* SEARCH */}
        <input
          className="form-control mb-3"
          placeholder="Search products..."
          onChange={(e) => handleSearch(e.target.value)}
        />

        {/* STATS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "15px",
          marginBottom: "20px"
        }}>
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
        <div className="card p-3 mb-3">

          <h5 className="mb-3">Add Product</h5>

          <div style={{
            display: "grid",
           gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px"
          }}>

            <input id="code" placeholder="Code" />
            <input id="name" placeholder="Name" />
            <input id="category" placeholder="Category" />
            <input id="details" placeholder="Details" />
            <input id="unit" placeholder="Unit" />
            <input id="quantity" placeholder="Qty" />
            <input id="price" placeholder="Price" />

            <button onClick={addProduct} style={{ gridColumn: "span 4" }}>
              {editId ? "Update Product" : "Save Product"}
            </button>

          </div>
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
  <span className={`status-badge ${getStatusClass(p.quantity)}`}>
    {getStockStatus(p.quantity)}
  </span>
</td>
                  <td>
                    <button onClick={() => editProduct(p)}>Edit</button>

                    <button
                      onClick={() => deleteProduct(p.id)}
                      style={{ background: "red", marginLeft: "5px" }}
                    >
                      Delete
                    </button>
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