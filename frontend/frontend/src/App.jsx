import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customer_id: "",
    amount: "",
    location: "",
    transaction_type: "ONLINE",
    device_id: "",
  });

  const loadTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions`);

      if (!response.ok) {
        throw new Error("Transactions API failed");
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load transactions");
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);

      if (!response.ok) {
        throw new Error("Stats API failed");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load statistics");
    }
  };

  useEffect(() => {
    loadTransactions();
    loadStats();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: form.customer_id,
          amount: Number(form.amount),
          location: form.location,
          transaction_type: form.transaction_type,
          device_id: form.device_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      const result = await response.json();

      console.log("New transaction:", result);

      setForm({
        customer_id: "",
        amount: "",
        location: "",
        transaction_type: "ONLINE",
        device_id: "",
      });

      await loadTransactions();
      await loadStats();

    } catch (error) {
      console.error(error);
      setError("Unable to create transaction");
    }
  };

  return (
    <div className="dashboard">

      <h1>Real-Time Fraud Detection Dashboard</h1>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {/* New Transaction */}

      <section className="form-section">

        <h2>New Transaction</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="customer_id"
            placeholder="Customer ID"
            value={form.customer_id}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
          />

          <select
            name="transaction_type"
            value={form.transaction_type}
            onChange={handleChange}
          >
            <option value="ONLINE">ONLINE</option>
            <option value="UPI">UPI</option>
            <option value="CARD">CARD</option>
            <option value="INTERNATIONAL">
              INTERNATIONAL
            </option>
          </select>

          <input
            type="text"
            name="device_id"
            placeholder="Device ID"
            value={form.device_id}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Analyze Transaction
          </button>

        </form>

      </section>

      {/* Statistics */}

      {stats && (
        <section className="stats-section">

          <h2>Statistics</h2>

          <div className="stats-grid">

            <div className="stat-card">
              <h3>Total Transactions</h3>
              <p>{stats.total_transactions}</p>
            </div>

            <div className="stat-card">
              <h3>High Risk</h3>
              <p>{stats.high_risk_transactions}</p>
            </div>

            <div className="stat-card">
              <h3>Flagged</h3>
              <p>{stats.flagged_transactions}</p>
            </div>

            <div className="stat-card">
              <h3>Medium Risk</h3>
              <p>{stats.medium_risk_transactions}</p>
            </div>

            <div className="stat-card">
              <h3>Low Risk</h3>
              <p>{stats.low_risk_transactions}</p>
            </div>

          </div>

        </section>
      )}

      {/* Transactions */}

      <h2>Recent Transactions</h2>

      <table>

        <thead>
          <tr>
            <th>Customer</th>
            <th>Amount</th>
            <th>Location</th>
            <th>Risk Score</th>
            <th>Risk Level</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {transactions.length === 0 ? (

            <tr>
              <td colSpan="6">
                No transactions found
              </td>
            </tr>

          ) : (

            transactions.map((transaction) => (

              <tr key={transaction.id}>

                <td>{transaction.customer_id}</td>

                <td>₹{transaction.amount}</td>

                <td>{transaction.location}</td>

                <td>{transaction.risk_score}</td>

                <td>{transaction.risk_level}</td>

                <td>{transaction.status}</td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

export default App;