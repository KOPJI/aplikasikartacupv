import React from 'react';

interface TableProps {
  children?: any;
  className?: string;
}

export const Table: React.FC<TableProps>;
export const TableHeader: React.FC<TableProps>;
export const TableBody: React.FC<TableProps>;
export const TableRow: React.FC<TableProps>;
export const TableHead: React.FC<TableProps>;
export const TableCell: React.FC<TableProps>; 