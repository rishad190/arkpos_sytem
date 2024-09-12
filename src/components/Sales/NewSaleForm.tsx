// components/NewSaleForm.tsx
"use client";

import { useState } from "react";

import { getDatabase, ref, push, set } from "firebase/database";

type Product = {
  id: number;
  name: string;
  price: number;
  editablePrice?: number;
  stock: number;
};

const dummyProducts: Product[] = [
  { id: 1, name: "Cotton", price: 9.99, stock: 100 },
  { id: 2, name: "Silk", price: 14.99, stock: 50 },
  { id: 3, name: "Linen", price: 19.99, stock: 75 },
];

export default function NewSaleForm({}: {}) {
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    mobileNumber: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [selectedProducts, setSelectedProducts] = useState<
    Array<Product & { meters: number }>
  >([]);
  const [isMetersModalOpen, setIsMetersModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [meters, setMeters] = useState<number>(0);
  const [totalFabricStock, setTotalFabricStock] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addProduct = () => {
    if (selectedProductId !== null && meters > 0) {
      const product = dummyProducts.find((p) => p.id === selectedProductId);
      if (product) {
        setSelectedProducts((prevProducts) => {
          const existingProductIndex = prevProducts.findIndex(
            (p) => p.id === selectedProductId
          );
          if (existingProductIndex !== -1) {
            // Update existing product
            const updatedProducts = [...prevProducts];
            updatedProducts[existingProductIndex].meters += meters;
            return updatedProducts;
          } else {
            // Add new product
            return [
              ...prevProducts,
              { ...product, meters, editablePrice: product.price },
            ];
          }
        });
        setTotalFabricStock((prevTotal) => prevTotal + meters);
      }
    }
    setIsMetersModalOpen(false);
    setSelectedProductId(null);
    setMeters(0);
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const total = selectedProducts.reduce(
    (sum, product) =>
      sum + (product.editablePrice || product.price) * product.meters,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // This line prevents the default form submission

    const saleData = {
      ...formData,
      products: selectedProducts,
      total,
      timestamp: new Date().toISOString(),
    };

    try {
      const db = getDatabase();
      const salesRef = ref(db, "sales");
      const newSaleRef = push(salesRef);
      await set(newSaleRef, saleData);

      setSuccessMessage("Sale added successfully!");
      setSelectedProducts([]);
      setFormData({
        customerName: "",
        address: "",
        mobileNumber: "",
        date: new Date().toISOString().split("T")[0],
      });
      // Clear the success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding sale:", error);
      setSuccessMessage("Error adding sale. Please try again.");
    }
  };

  const updateProductPrice = (productId: number, newPrice: number) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.id === productId ? { ...p, editablePrice: newPrice } : p
      )
    );
  };

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = Number(e.target.value);
    if (productId) {
      setSelectedProductId(productId);
      setSelectedProduct(dummyProducts.find((p) => p.id === productId) || null);
      setIsMetersModalOpen(true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block mb-1">
            Customer Name
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="address" className="block mb-1">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="mobileNumber" className="block mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="date" className="block mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="product-select" className="block mb-2">
            Add Fabric:
          </label>
          <div className="flex space-x-2">
            <select
              id="product-select"
              className="flex-grow p-2 border rounded"
              onChange={onChange}
              value={selectedProductId || ""}
            >
              <option value="">Select a fabric</option>
              {dummyProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price.toFixed(2)}/meter
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Selected Fabrics:</h3>
          <ul className="space-y-2">
            {selectedProducts.map((product) => (
              <li
                key={`${product.id}-${Date.now()}`}
                className="flex justify-between items-center"
              >
                <span>
                  {product.name} - {product.meters} meters
                </span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={product.editablePrice || product.price}
                    onChange={(e) =>
                      updateProductPrice(product.id, parseFloat(e.target.value))
                    }
                    className="w-20 p-1 border rounded"
                    step="0.01"
                    min="0"
                  />
                  <span>
                    - $
                    {(
                      (product.editablePrice || product.price) * product.meters
                    ).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="font-bold">Total: ${total.toFixed(2)}</div>

        <div className="font-semibold">
          Total Fabric Stock: {totalFabricStock.toFixed(2)} meters
        </div>

        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={selectedProducts.length === 0}
        >
          Complete Sale
        </button>
      </form>
      {isMetersModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Enter Meters</h3>
            {selectedProduct && (
              <p className="mb-2">Available: {selectedProduct.stock} meters</p>
            )}
            <input
              type="number"
              value={meters}
              onChange={(e) => setMeters(parseFloat(e.target.value))}
              className="w-full p-2 border rounded mb-4"
              min="0"
              max={selectedProduct?.stock || 0}
              step="0.01"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsMetersModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={addProduct}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
