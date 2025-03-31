'use client';

import { useEffect, useState } from 'react';

interface Message {
  id: number;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

export default function AgentMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    // Fetch messages dynamically from an API or database
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages'); // Replace with actual API endpoint
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  const markAsRead = (messageId: number) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return messageTime.toLocaleString();
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center"> View Messages</h1>

      {/* Message List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages available</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 border rounded-lg cursor-pointer transition hover:shadow-md ${
                message.isRead ? 'bg-white' : 'bg-gray-100'
              }`}
              onClick={() => handleMessageClick(message)}
            >
              <p className={`font-medium ${message.isRead ? 'text-gray-700' : 'text-black'}`}>
                {message.subject}
              </p>
              <p className="text-sm text-gray-600">{message.body.substring(0, 50)}...</p>
              <p className="text-xs text-gray-500">Received {formatTimestamp(message.timestamp)}</p>
            </div>
          ))
        )}
      </div>

      {/* Message Details */}
      {selectedMessage && (
        <div className="mt-8 p-6 border rounded-lg bg-gray-50 shadow-md">
          <h2 className="text-xl font-bold mb-4">{selectedMessage.subject}</h2>
          <p className="text-gray-700">{selectedMessage.body}</p>
          <p className="text-xs text-gray-500 mt-4">Received {formatTimestamp(selectedMessage.timestamp)}</p>
        </div>
      )}
    </div>
  );
}
