"use client"
import { useEffect, useRef } from 'react';

// Constants
const DARK_TILE = [181, 136, 99];
const LIGHT_TILE = [240, 217, 181];

export default function P5Board() {
  const renderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let p5Instance: any;

    const initializeP5 = async () => {
      if (typeof window === 'undefined' || !renderRef.current) return;

      try {
        const p5 = (await import('p5')).default;

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

          const isLightSquare = (x: number, y: number): boolean => (x + y) % 2 === 0;

          const drawBoard = () => {
            const tileSize = canvasSize / 8;
            p.noStroke();

            for (let y = 0; y < 8; y++) {
              for (let x = 0; x < 8; x++) {
                p.fill(isLightSquare(x, y) ? LIGHT_TILE : DARK_TILE);
                p.rect(x * tileSize, y * tileSize, tileSize, tileSize);
              }
            }
          };

          p.draw = () => {
            p.background(250);
            drawBoard();
          };
        }, renderRef.current);
      } catch (error) {
        console.error("Failed to load p5.js:", error);
      }
    };

    initializeP5();
    return () => p5Instance?.remove();
  }, []);

  return <div ref={renderRef} />;
}
