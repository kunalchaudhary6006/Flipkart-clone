const DEFAULT_PRODUCTS = [
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

export const getFallbackProducts = () => {
  const stored = localStorage.getItem('mock_products');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored products', e);
    }
  }
  return DEFAULT_PRODUCTS;
};

export const setFallbackProducts = (products: any[]) => {
  localStorage.setItem('mock_products', JSON.stringify(products));
};

export const deleteFallbackProduct = (id: string) => {
  const current = getFallbackProducts();
  const updated = current.filter((p: any) => p._id !== id);
  setFallbackProducts(updated);
};

export const saveFallbackProduct = (product: any) => {
  const current = getFallbackProducts();
  const index = current.findIndex((p: any) => p._id === product._id);
  if (index !== -1) {
    current[index] = product;
  } else {
    product._id = "m_" + Date.now();
    current.push(product);
  }
  setFallbackProducts(current);
};

export const fallbackOrders = [];
