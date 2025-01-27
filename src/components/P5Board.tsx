"use client"
import { store } from '@/store';
import { P5CanvasInstance } from '@p5-wrapper/react';
import p5 from 'p5';
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

        p5Instance = new p5((p5: P5CanvasInstance) => {
          const pieceImages: Record<string, p5.Image> = {};
          let canvasSize = Math.min(window.innerWidth, window.innerHeight);

          p5.preload = () => {
            const pieces = ['p', 'n', 'b', 'r', 'q', 'k'];
            const colors = ['w', 'b'];
            pieces.forEach(piece => {
              colors.forEach(color => {
                const fileName = color + piece.toUpperCase();
                pieceImages[fileName] = p5.loadImage(`/piece/cburnett/${fileName}.svg`);
              });
            });
            //castleImage = p5.loadImage('/images/castle.png');
          };

          p5.setup = () => {
            const canvas = p5.createCanvas(canvasSize, canvasSize);
            canvas.parent(renderRef.current);

            window.addEventListener('resize', () => {
              canvasSize = Math.min(window.innerWidth, window.innerHeight);
              p5.resizeCanvas(canvasSize, canvasSize);
            });
          };

          const isLightSquare = (x: number, y: number): boolean => (x + y) % 2 === 0;

          const drawBoard = () => {
            const tileSize = canvasSize / 8;
            p5.noStroke();

            for (let y = 0; y < 8; y++) {
              for (let x = 0; x < 8; x++) {
                p5.fill(isLightSquare(x, y) ? LIGHT_TILE : DARK_TILE);
                p5.rect(x * tileSize, y * tileSize, tileSize, tileSize);
              }
            }
          };

          const drawPieces = () => {
            const tileSize = canvasSize / 8;
            store.localChess.board().forEach((row, y) => {
              row.forEach((piece, x) => {
                if (piece) {
                  const fileName = piece.color + piece.type.toUpperCase();
                  const img = pieceImages[fileName];
                  if (img) {
                    let drawX = x, drawY = y;
                    p5.image(img, drawX * tileSize, drawY * tileSize, tileSize, tileSize);
                  }
                }
              });
            });
          };

          p5.draw = () => {
            p5.background(250);
            drawBoard();
            drawPieces();
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
