import React, { useEffect, useRef } from "react";
import { ShoppingCart, X, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";

const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { items, loading, removeFromCart, updateQuantity } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleClose = () => onClose();

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  return (
    <>
      {/* Overlay to capture clicks outside drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleClose}
        />
      )}
      
      <div 
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-80 bg-[#0f172a] shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-blue-800">
            <h2 className="text-xl font-bold text-white">Your Cart</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <p className="text-center py-6 text-white">Loading cart...</p>
            ) : items.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-300 mb-4">Your cart is empty</p>
                <button
                  onClick={handleClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 pb-3 border-b border-blue-800">
                    <div className="w-16 h-16 relative flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image 
                          src={typeof item.product.images[0] === 'string' 
                            ? item.product.images[0] 
                            : item.product.images[0].url} 
                          alt={item.product.name} 
                          fill 
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
                          <ShoppingCart size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.product.name}</h3>
                      <div className="flex items-center mt-1">
                        <button 
                          onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-300 hover:text-blue-400 p-1"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="mx-2 text-sm text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-300 hover:text-blue-400 p-1"
                        >
                          <Plus size={16} />
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-red-400 hover:text-red-300 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="font-medium text-blue-400 mt-1">${item.product.price.toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t border-blue-800">
              <div className="flex justify-between mb-4 text-white">
                <span className="font-medium">Total:</span>
                <span className="font-bold">${calculateTotal().toFixed(2)}</span>
              </div>
              <Link 
                href="/checkout" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 text-center rounded transition-colors"
              >
                Checkout
              </Link>
              <button
                onClick={handleClose}
                className="block w-full mt-2 border border-blue-600 text-blue-400 hover:bg-blue-900/30 py-2 text-center rounded transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer; 