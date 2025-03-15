'use client';

import { useState } from 'react';

const AgentPage = () => {
  const [goodsId, setGoodsId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [weight, setWeight] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data to be sent
    const formData = {
      goodsId,
      customerName,
      weight,
    };

    try {
      // Send the data to the backend
      const response = await fetch('/api/notifyAdmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if the response is successful
      if (response.ok) {
        setIsSubmitted(true);
        setGoodsId('');
        setCustomerName('');
        setWeight('');
      } else {
        throw new Error('Failed to send the message');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-lg shadow-lg">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4 sm:mb-6">Agent Pickup</h2>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="goodsId" className="block text-sm font-medium text-gray-700">
              Goods ID
            </label>
            <input
              type="text"
              id="goodsId"
              name="goodsId"
              value={goodsId}
              onChange={(e) => setGoodsId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Weight of Goods (kg)
            </label>
            <input
              type="number = double"
              id="weight"
              name="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="w-2/4 bg-blue-600 text-white py-2 px-1 rounded-md hover:bg-blue-700 transition-all duration-300"
            >
              {isSubmitted ? 'Goods Picked Up' : 'Confirm Pickup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentPage;
