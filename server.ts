import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';

// --- Mongoose Models ---
const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  originalPrice: Number,
  sellingPrice: Number,
  category: String,
  imageUrl: String,
  stock: Number
});

const OrderSchema = new mongoose.Schema({
  customerDetails: {
    name: String,
    phone: String,
    address: String
  },
  items: Array,
  totalValue: Number,
  utrTransactionId: String,
  orderStatus: { type: String, default: 'Pending Verification' },
  orderDate: { type: Date, default: Date.now }
});

// @ts-ignore
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
// @ts-ignore
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// --- In-Memory Fallback Data ---
// We use these if MONGODB_URI is not provided in the environment.
let mockProducts = [
  {
    _id: "m_1",
    title: "SAMSUNG Galaxy S24 Ultra 5G",
    description: "Titanium Gray, 256 GB",
    originalPrice: 134999,
    sellingPrice: 129999,
    category: "Mobiles",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop",
    stock: 50
  },
  {
    _id: "m_2",
    title: "Apple MacBook Air M3",
    description: "Space Grey, 8GB RAM, 256GB SSD",
    originalPrice: 114900,
    sellingPrice: 104900,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop",
    stock: 20
  },
  {
    _id: "m_3",
    title: "Sony WH-1000XM5 Headphones",
    description: "Wireless Noise Cancelling, Black",
    originalPrice: 34990,
    sellingPrice: 29990,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop",
    stock: 100
  },
  {
    _id: "m_4",
    title: "Puma Running Shoes",
    description: "Velocity Nitro 2, Black/White",
    originalPrice: 8999,
    sellingPrice: 4499,
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    stock: 200
  },
  {
    _id: "m_5",
    title: "LG 55 inch 4K Smart TV",
    description: "OLED Evo Gallery Edition",
    originalPrice: 129990,
    sellingPrice: 89990,
    category: "Appliances",
    imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&h=500&fit=crop",
    stock: 15
  }
];

let mockOrders: any[] = [];

// --- Server Setup ---
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let isDbConnected = false;

// Connect to MongoDB if URI is provided, else log warning and use mock arrays.
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB cluster via Mongoose.');
      isDbConnected = true;
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB. Falling back to in-memory store.', err);
    });
} else {
  console.log('MONGODB_URI not found in env. Falling back to in-memory store for demonstration.');
}

// --- API Routes ---

app.get('/api/products', async (req, res) => {
  try {
    if (isDbConnected) {
      const products = await Product.find();
      res.json(products);
    } else {
      res.json(mockProducts);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    if (isDbConnected) {
      // @ts-ignore
      const product = await Product.findOne({ _id: req.params.id });
      if (product) res.json(product);
      else res.status(404).json({ error: 'Product not found' });
    } else {
      const product = mockProducts.find(p => p._id === req.params.id);
      if (product) res.json(product);
      else res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    if (isDbConnected) {
      const newProduct = new Product(req.body);
      await newProduct.save();
      res.status(201).json(newProduct);
    } else {
      const newProduct = { 
        ...req.body, 
        _id: "m_new_" + Date.now(),
        originalPrice: Number(req.body.originalPrice),
        sellingPrice: Number(req.body.sellingPrice),
        stock: Number(req.body.stock)
      };
      mockProducts.push(newProduct);
      res.status(201).json(newProduct);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    if (isDbConnected) {
      // @ts-ignore
      const product = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
      if (product) res.json(product);
      else res.status(404).json({ error: 'Product not found' });
    } else {
      const index = mockProducts.findIndex(p => p._id === req.params.id);
      if (index > -1) {
        mockProducts[index] = { ...mockProducts[index], ...req.body, originalPrice: Number(req.body.originalPrice), sellingPrice: Number(req.body.sellingPrice), stock: Number(req.body.stock) };
        res.json(mockProducts[index]);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    if (isDbConnected) {
      // @ts-ignore
      await Product.findOneAndDelete({ _id: req.params.id });
      res.status(204).end();
    } else {
      mockProducts = mockProducts.filter(p => p._id !== req.params.id);
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    if (isDbConnected) {
      const newOrder = new Order(req.body);
      await newOrder.save();
      res.status(201).json(newOrder);
    } else {
      const newOrder = {
        ...req.body,
        _id: "ord_" + Date.now(),
        orderStatus: req.body.orderStatus || 'Pending Verification',
        orderDate: new Date()
      };
      mockOrders.push(newOrder);
      res.status(201).json(newOrder);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    if (isDbConnected) {
      const orders = await Order.find().sort({ orderDate: -1 });
      res.json(orders);
    } else {
      res.json([...mockOrders].reverse());
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (isDbConnected) {
      // @ts-ignore
      const order = await Order.findOneAndUpdate({ _id: req.params.id }, { orderStatus: status }, { new: true });
      res.json(order);
    } else {
      const orderIndex = mockOrders.findIndex(o => o._id === req.params.id);
      if (orderIndex > -1) {
        mockOrders[orderIndex].orderStatus = status;
        res.json(mockOrders[orderIndex]);
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});


// --- Vite Full-Stack Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
