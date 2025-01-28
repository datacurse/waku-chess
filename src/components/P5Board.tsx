"use client"
import { store } from '@/store';
import { selectSquare } from '@/storeFunctions/game';
import { P5CanvasInstance } from '@p5-wrapper/react';
import { Square } from 'chess.js';
import { useEffect, useRef } from 'react';

// Constants
const DARK_TILE = [181, 136, 99];
const LIGHT_TILE = [240, 217, 181];
const DARK_GREEN = [100, 111, 64];
const LIGHT_GREEN = [130, 151, 105];
const DARK_HIGHLIGHT = [170, 162, 58];  // #AAA23A
const LIGHT_HIGHLIGHT = [205, 210, 106]; // #CDD26A

type Position = [number, number];

export function squareToPosition(square: Square, color: 'b' | 'w'): Position {
  const x = square.charCodeAt(0) - 97; // 'a' is 97 in ASCII
  const y = 8 - parseInt(square[1]!);
  if (color === 'b' && !store.isBoardRotated || color === 'w' && store.isBoardRotated) {
    return [7 - x, 7 - y];
  }
  return [x, y];
}

export default function P5Board() {
  const renderRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const p5Ref = useRef<any>(null);

  useEffect(() => {
    // Only initialize p5 once:
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      const initializeP5 = async () => {
        if (typeof window === 'undefined' || !renderRef.current) return;
        try {
          const p5 = (await import('p5')).default;

          p5Ref.current = new p5((p5: P5CanvasInstance) => {
            const pieceImages: Record<string, p5.Image> = {};
            let canvasSize = Math.min(window.innerWidth, window.innerHeight);

            p5.preload = () => {
              const pieces = ['p', 'n', 'b', 'r', 'q', 'k'];
              const colors = ['w', 'b'];
              pieces.map(piece => {
                colors.map(color => {
                  const fileName = color + piece.toUpperCase();
                  pieceImages[fileName] = p5.loadImage(`/piece/cburnett/${fileName}.svg`);
                  return null;
                });
                return null;
              });
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
              [...Array(8)].map((_, y) => {
                return [...Array(8)].map((_, x) => {
                  p5.fill(isLightSquare(x, y) ? LIGHT_TILE : DARK_TILE);
                  p5.rect(x * tileSize, y * tileSize, tileSize, tileSize);
                  return null;
                });
              });
            };

            const drawPieces = () => {
              const tileSize = canvasSize / 8;
              store.chess.board().map((row, y) => {
                row.map((piece, x) => {
                  if (piece) {
                    const fileName = piece.color + piece.type.toUpperCase();
                    const img = pieceImages[fileName];
                    if (img) {
                      let drawX = x, drawY = y;
                      p5.image(img, drawX * tileSize, drawY * tileSize, tileSize, tileSize);
                    }
                  }
                  return null;
                });
                return null;
              });
            };

            function drawSelectedSquare(selectedSquare: Square) {
              const tileSize = p5.width / 8;
              const [x, y] = squareToPosition(selectedSquare, 'w');
              p5.noStroke();
              if (isLightSquare(x, y)) {
                p5.fill(LIGHT_GREEN);
              } else {
                p5.fill(DARK_GREEN);
              }
              p5.rect(x * tileSize, y * tileSize, tileSize, tileSize);
            }

            p5.mousePressed = () => {
              const tileSize = canvasSize / 8;
              const x = Math.floor(p5.mouseX / tileSize);
              const y = Math.floor(p5.mouseY / tileSize);
              const clickedSquare = `${'abcdefgh'[x]}${8 - y}` as Square;
              selectSquare(clickedSquare);
            };

            p5.draw = () => {
              p5.background(250);
              drawBoard();
              if (store.selectedSquare) {
                drawSelectedSquare(store.selectedSquare);
              }
              drawPieces();
            };
          }, renderRef.current);
        } catch (error) {
          console.error("Failed to load p5.js:", error);
        }
      };

      initializeP5();
    }

    // Cleanup
    return () => {
      if (p5Ref.current && p5Ref.current.remove) {
        p5Ref.current.remove();
      }
    };
  }, []);

  return <div ref={renderRef} />;
}

