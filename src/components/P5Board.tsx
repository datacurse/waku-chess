// P5BoardComponent.tsx
"use client"
import { useEffect, useRef } from 'react';
import { store } from "@/store";
import { Color, Square } from "chess.js";

// Constants
const DARK_TILE = [181, 136, 99];
const LIGHT_TILE = [240, 217, 181];

type Position = [number, number];

export function squareToPosition(square: Square, color: Color): Position {
  const x = square.charCodeAt(0) - 97;
  const y = 8 - parseInt(square[1]!);
  if (color === 'b' && !store.isBoardRotated || color === 'w' && store.isBoardRotated) {
    return [7 - x, 7 - y];
  }
  return [x, y];
}

// Make this a default export
export default function P5Board() {
  const renderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let p5Instance: any;

    const loadP5 = async () => {
      if (!renderRef.current || typeof window === 'undefined') return;

      try {
        // Dynamically import p5 only in the browser
        const p5Module = await import('p5');
        const p5 = p5Module.default;

        p5Instance = new p5((p: any) => {
          let canvasSize = Math.min(window.innerWidth, window.innerHeight);

          p.setup = () => {
            const canvas = p.createCanvas(canvasSize, canvasSize);
            canvas.parent(renderRef.current);

            window.addEventListener('resize', () => {
              canvasSize = Math.min(window.innerWidth, window.innerHeight);
              p.resizeCanvas(canvasSize, canvasSize);
            });
          };

          function isLightSquare(squareOrPosition: Position): boolean {
            const [x, y] = squareOrPosition;
            return (x + y) % 2 === 0;
          }

          function drawBoard() {
            const tileSize = canvasSize / 8;
            p.noStroke();
            for (let y = 0; y < 8; y++) {
              for (let x = 0; x < 8; x++) {
                if (isLightSquare([x, y])) {
                  p.fill(LIGHT_TILE);
                } else {
                  p.fill(DARK_TILE);
                }
                p.rect(x * tileSize, y * tileSize, tileSize, tileSize);
              }
            }
          }

          p.draw = () => {
            p.background(250);
            drawBoard();
          };
        }, renderRef.current);
      } catch (error) {
        console.error("Error loading p5:", error);
      }
    };

    loadP5();

    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, []);

  return <div ref={renderRef} />;
}
