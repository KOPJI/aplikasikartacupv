import React from 'react';

interface TableProps {
  children?: any;
  className?: string;
}

const Table = ({
  children,
  className = '',
  ...props
}: TableProps) => (
  <div className="w-full overflow-auto">
    <table
      className={`w-full caption-bottom text-sm ${className}`}
      {...props}
    >
      {children}
    </table>
  </div>
);

const TableHeader = ({
  children,
  className = '',
  ...props
}: TableProps) => (
  <thead className={`[&_tr]:border-b ${className}`} {...props}>
    {children}
  </thead>
);

const TableBody = ({
  children,
  className = '',
  ...props
}: TableProps) => (
  <tbody
    className={`[&_tr:last-child]:border-0 ${className}`}
    {...props}
  >
    {children}
  </tbody>
);

const TableRow = ({
  children,
  className = '',
  ...props
}: TableProps) => (
  <tr
    className={`border-b transition-colors hover:bg-gray-50/50 ${className}`}
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({
  children,
  className = '',
  ...props
}: TableProps) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({
  children,
  className = '',
  ...props
}: TableProps) => (
  <td
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </td>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }; 