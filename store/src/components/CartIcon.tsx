'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

const CartIcon = ({ onCartClick }: { onCartClick?: () => void }) => {
  const { items } = useCart();
  
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const handleClick = (e: React.MouseEvent) => {
    if (onCartClick) {
      e.preventDefault();
      onCartClick();
    }
  };

  return (
    <Link href="/cart" className="relative" onClick={handleClick}>
      <ShoppingCart className="h-6 w-6 text-navy hover:text-gold transition-colors duration-200" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-gold text-navy text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon; 