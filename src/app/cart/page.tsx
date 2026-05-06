"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen bg-white flex items-center justify-center px-4 overflow-hidden">
        <div className="splash splash-blue h-72 w-72 -right-20 top-20" />
        <div className="splash splash-violet h-56 w-56 -left-16 bottom-40" />
        <div className="relative text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="mx-auto mb-4 h-24 w-24 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="mt-2 text-gray-500">Browse our products and find something you love.</p>
          <Button asChild className="mt-6 bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <div className="splash splash-blue h-72 w-72 -right-20 top-20" />
      <div className="splash splash-violet h-56 w-56 -left-16 bottom-40" />
      <div className="splash splash-teal h-48 w-48 right-1/3 bottom-20" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 z-10">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="mt-1 text-gray-500">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
              {items.map((item) => (
                <div key={item._id} className="flex gap-4 p-5">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain p-2" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300 text-xs">No image</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.condition}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-1 text-gray-400 hover:text-gray-900">-</button>
                        <span className="px-3 py-1 text-sm font-medium text-gray-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-1 text-gray-400 hover:text-gray-900">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-sm text-red-500 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">R{(item.price * item.quantity).toLocaleString()}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-500">R{item.price.toLocaleString()} each</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-gray-500 italic">Calculated at checkout</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>R{total.toLocaleString()}</span>
                </div>
              </div>
              <Button asChild className="mt-6 w-full bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal shadow-lg shadow-royal/25">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Link href="/products" className="mt-3 block text-center text-sm text-steel hover:text-violet-bright transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
