import React from 'react';

export const Table = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full">{children}</table>
    </div>
  );
};

export const TableHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <thead className="bg-gray-100 text-sm text-gray-500">
      {children}
    </thead>
  );
};

export const TableBody = ({ children }: { children: React.ReactNode }) => {
  return <tbody>{children}</tbody>;
};

export const TableRow = ({ children }: { children: React.ReactNode }) => {
  return <tr className="border-b">{children}</tr>;
};

export const TableCell = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <td className={`px-4 py-2 text-sm ${className}`}>
      {children}
    </td>
  );
};
