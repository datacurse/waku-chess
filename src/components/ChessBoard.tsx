// ChessBoard.tsx
"use client"
import { lazy, Suspense } from 'react';

// Dynamically import the P5Board component with proper default export
const P5Board = lazy(() => import('./P5Board'));

export function ChessBoard() {
  return (
    <Suspense fallback={<div>Loading board...</div>}>
      <P5Board />
    </Suspense>
  );
}
