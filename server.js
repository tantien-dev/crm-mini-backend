const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// 🔹 Đường dẫn đến file dữ liệu JSON
const DATA_FILE = path.join(__dirname, "data.json");

// 🟢 Middleware cơ bản
app.use(cors());
app.use(express.json());

// 🟣 Middleware log mọi request (để theo dõi hoạt động API)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// 🔸 Hàm đọc dữ liệu từ file JSON (an toàn)
const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.warn("⚠️ File data.json chưa tồn tại. Tạo mới file...");
      fs.writeFileSync(DATA_FILE, "[]", "utf8");
      return [];
    }

    const data = fs.readFileSync(DATA_FILE, "utf8").trim();
    if (!data) return [];

    return JSON.parse(data);
  } catch (err) {
    console.error("⚠️ Không thể đọc file dữ liệu:", err.message);
    return [];
  }
};

// 🔸 Hàm ghi dữ liệu vào file JSON
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("⚠️ Không thể ghi dữ liệu:", err.message);
  }
};

// 🟢 API: Lấy danh sách khách hàng
app.get("/customers", (req, res) => {
  const customers = readData();
  res.json(customers);
});

// 🟢 API: Thêm khách hàng mới
app.post("/customers", (req, res) => {
  const customers = readData();
  const newCustomer = { id: Date.now(), ...req.body };
  customers.push(newCustomer);
  writeData(customers);
  res.status(201).json(newCustomer);
});

// 🟢 API: Cập nhật khách hàng
app.put("/customers/:id", (req, res) => {
  const { id } = req.params;
  const customers = readData();
  const index = customers.findIndex((c) => c.id == id);

  if (index === -1) {
    return res.status(404).json({ message: "Không tìm thấy khách hàng!" });
  }

  customers[index] = { ...customers[index], ...req.body };
  writeData(customers);
  res.json(customers[index]);
});

// 🟢 API: Xóa khách hàng
app.delete("/customers/:id", (req, res) => {
  const { id } = req.params;
  const customers = readData();
  const filtered = customers.filter((c) => c.id != id);
  writeData(filtered);
  res.json({ message: "Đã xóa khách hàng!" });
});

// 🟣 Kiểm tra trạng thái server
app.get("/", (req, res) => {
  res.send("🚀 CRM Mini API đang hoạt động!");
});

// 🟣 Chạy server
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`);
});
