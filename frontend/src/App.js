import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import './App.css';

const App = () => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem("currentUser") || "";
  });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("currentUser"));
  const [isSignup, setIsSignup] = useState(false);
  const [authUser, setAuthUser] = useState("");
  const [authPass, setAuthPass] = useState("");

  const [transactions, setTransactions] = useState(() => {
  const saved = localStorage.getItem("transactions");
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}, [transactions]);


  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("transactions_" + currentUser, JSON.stringify(transactions));
    }
  }, [transactions, currentUser]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const handleSignup = () => {
    if (!authUser || !authPass) {
      alert("Fill all fields");
      return;
    }
    if (users.find((u) => u.username === authUser)) {
      alert("User already exists");
      return;
    }
    const newUser = { username: authUser, password: authPass };
    setUsers([...users, newUser]);
    setCurrentUser(authUser);
    setIsLoggedIn(true);
    localStorage.setItem("currentUser", authUser);
    setAuthUser("");
    setAuthPass("");
  };

  const handleLogin = () => {
    const user = users.find((u) => u.username === authUser && u.password === authPass);
    if (!user) {
      alert("Invalid credentials");
      return;
    }
    setCurrentUser(user.username);
    setIsLoggedIn(true);
    localStorage.setItem("currentUser", user.username);
    const savedTransactions = localStorage.getItem("transactions_" + user.username);
    setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
    setAuthUser("");
    setAuthPass("");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser("");
    localStorage.removeItem("currentUser");
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: "2rem", fontFamily: "Arial" }}>
        <h2>{isSignup ? "Create an Account 🔐" : "Login to Personal Finance Tracker 🔐"}</h2>
        <input
          type="text"
          placeholder="Username"
          value={authUser}
          onChange={(e) => setAuthUser(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={authPass}
          onChange={(e) => setAuthPass(e.target.value)}
          style={{ marginTop: "0.5rem" }}
        />
        <br />
        <button onClick={isSignup ? handleSignup : handleLogin} style={{ marginTop: "1rem" }}>
          {isSignup ? "Sign Up" : "Login"}
        </button>
        <p style={{ marginTop: "1rem" }}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    );
  }

  const addTransaction = () => {
    if (!description || !amount || !category || !date) {
      alert("Please fill all fields");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      category,
      date,
    };

    setTransactions([...transactions, newTransaction]);
    setDescription("");
    setAmount("");
    setCategory("");
    setDate("");
  };

  const deleteTransaction = (id) => {
    const updated = transactions.filter((txn) => txn.id !== id);
    setTransactions(updated);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredTransactions =
    filterCategory === "All"
      ? transactions
      : transactions.filter((txn) => txn.category === filterCategory);

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    if (sortConfig.key === "date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const categorySums = transactions.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
    return acc;
  }, {});

  const totalIncome = transactions
    .filter((txn) => txn.amount > 0)
    .reduce((acc, txn) => acc + txn.amount, 0);

  const totalExpense = transactions
    .filter((txn) => txn.amount < 0)
    .reduce((acc, txn) => acc + txn.amount, 0);

  const netSavings = transactions.reduce((acc, txn) => acc + txn.amount, 0);

  const getTopCategory = () => {
    if (transactions.length === 0) return "None";
    const sorted = Object.entries(categorySums).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    return sorted[0][0];
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Welcome, {currentUser}! 💰</h1>
      <div style={{ textAlign: "right" }}>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={addTransaction}>Add</button>
      </div>

      <p style={{ color: "#888", fontSize: "0.9rem" }}>
        💡 Tip: Income as +ve, Expense as -ve
      </p>

      <div style={{ marginTop: "1rem" }}>
        <label>Filter by category: </label>
        <select
          onChange={(e) => setFilterCategory(e.target.value)}
          value={filterCategory}
        >
          <option value="All">All</option>
          {[...new Set(transactions.map((txn) => txn.category))].map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <table border="1" cellPadding="8" style={{ marginTop: "1rem", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th onClick={() => handleSort("description")}>Description ⇅</th>
            <th onClick={() => handleSort("amount")}>Amount (₹) ⇅</th>
            <th onClick={() => handleSort("category")}>Category ⇅</th>
            <th onClick={() => handleSort("date")}>Date ⇅</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((txn) => (
            <tr key={txn.id}>
              <td>{txn.description}</td>
              <td>₹{txn.amount}</td>
              <td>{txn.category}</td>
              <td>{txn.date}</td>
              <td style={{ color: txn.amount < 0 ? "red" : "green" }}>
  ₹{txn.amount}
</td>

              <td>
                <button onClick={() => deleteTransaction(txn.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ width: "500px", marginTop: "2rem" }}>
        <h2>Spending by Category</h2>
        <Bar
          data={{
            labels: Object.keys(categorySums),
            datasets: [
              {
                label: "Amount Spent (₹)",
                data: Object.values(categorySums),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
              },
            ],
          }}
        />
      </div>

      <div style={{ width: "400px", marginTop: "2rem" }}>
        <h2>Income vs Expense</h2>
        <Pie
          data={{
            labels: ["Income", "Expense"],
            datasets: [
              {
                data: [totalIncome, Math.abs(totalExpense)],
                backgroundColor: ["#36A2EB", "#FF6384"],
              },
            ],
          }}
          options={{
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          }}
        />
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeeba",
          borderRadius: "8px",
          maxWidth: "500px",
        }}
      >
        <h2>💡 Smart Insights</h2>
        <p>
          {Math.abs(totalExpense) > totalIncome
            ? "⚠️ Warning: Your expenses exceeded your income!"
            : "✅ Great! You're spending within your limits."}
        </p>
        <p>📌 Highest spending category: <strong>{getTopCategory()}</strong></p>
        <p>💰 Total Savings: ₹{netSavings}</p>
      </div>
    </div>
  );
};

export default App;
