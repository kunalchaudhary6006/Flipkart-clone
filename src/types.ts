export interface Product {
    _id: string;
    title: string;
    description: string;
    originalPrice: number;
    sellingPrice: number;
    category: string;
    imageUrl: string;
    stock: number;
}
  
export interface CustomerDetails {
    name: string;
    phone: string;
    address: string;
}

export interface CartItem extends Product {
    quantity: number;
}
  
export interface Order {
    _id: string;
    customerDetails: CustomerDetails;
    items: CartItem[];
    totalValue: number;
    utrTransactionId: string;
    orderStatus: string;
    orderDate: string;
}
