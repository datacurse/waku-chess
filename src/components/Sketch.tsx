"use client"

import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { P5CanvasInstance, type Sketch } from "@p5-wrapper/react";
import { Color, Square } from "chess.js";
import { store } from "@/store";
import p5 from "p5";
//import { handlePromotion, selectSquare } from "@/storeFunctions/game";


type Position = [number, number]

export function squareToPosition(square: Square, color: Color): Position {
  const x = square.charCodeAt(0) - 97; // 'a' is 97 in ASCII
  const y = 8 - parseInt(square[1]!);
  if (color === 'b' && !store.isBoardRotated || color === 'w' && store.isBoardRotated) {
    return [7 - x, 7 - y];
  }
  return [x, y];
}

// Constants
const DARK_TILE = [181, 136, 99]
const LIGHT_TILE = [240, 217, 181]
const DARK_GREEN = [100, 111, 64];
const LIGHT_GREEN = [130, 151, 105];
const DARK_HIGHLIGHT = [170, 162, 58];  // #AAA23A
const LIGHT_HIGHLIGHT = [205, 210, 106]; // #CDD26A

const sketch: Sketch = (p5: P5CanvasInstance) => {
  const pieceImages: Record<string, p5.Image> = {};
  let castleImage: p5.Image | undefined;
  let imagesLoaded = false;
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
    castleImage = p5.loadImage('/images/castle.png');
  };
  p5.setup = () => {
    p5.createCanvas(canvasSize, canvasSize);
    imagesLoaded = true;
    window.addEventListener('resize', () => {
      canvasSize = Math.min(window.innerWidth, window.innerHeight);
      p5.resizeCanvas(canvasSize, canvasSize);
    });
  };

  function isLightSquare(squareOrPosition: [number, number]): boolean {
    const [x, y] = squareOrPosition;
    return (x + y) % 2 === 0;
  }

  function drawBoard() {
    const tileSize = canvasSize / 8;
    p5.noStroke();
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (isLightSquare([x, y])) {
          p5.fill(LIGHT_TILE);
        } else {
          p5.fill(DARK_TILE);
        }
        p5.rect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  //function drawPieces() {
  //  if (!imagesLoaded || !store.me) return;
  //  const tileSize = canvasSize / 8;
  //  store.historyChess.board().forEach((row, y) => {
  //    row.forEach((piece, x) => {
  //      if (piece) {
  //        const fileName = piece.color + piece.type.toUpperCase();
  //        const img = pieceImages[fileName];
  //        if (img) {
  //          // Calculate position based on color and board rotation
  //          let drawX = x, drawY = y;
  //          if (store.me?.color === "b" && !store.isBoardRotated ||
  //            store.me?.color === "w" && store.isBoardRotated) {
  //            drawX = 7 - x;
  //            drawY = 7 - y;
  //          }
  //          p5.image(img, drawX * tileSize, drawY * tileSize, tileSize, tileSize);
  //        }
  //      }
  //    });
  //  });
  //}

  //function drawSelectedSquare(selectedSquare: Square) {
  //  if (!store.me) return;
  //
  //  const tileSize = p5.width / 8;
  //  const [x, y] = squareToPosition(selectedSquare, store.me.color);
  //
  //  p5.noStroke();
  //  if (isLightSquare([x, y])) {
  //    p5.fill(LIGHT_GREEN);
  //  } else {
  //    p5.fill(DARK_GREEN);
  //  }
  //  p5.rect(x * tileSize, y * tileSize, tileSize, tileSize);
  //}

  //function drawPossibleMoves() {
  //  if (!store.me || !store.selectedSquare) return;
  //  const tileSize = canvasSize / 8;
  //  p5.noStroke();
  //  const possibleMoves = store.historyChess.moves({ square: store.selectedSquare, verbose: true });
  //  possibleMoves.forEach((move) => {
  //    const [x, y] = squareToPosition(move.to, store.me?.color);
  //    if (isLightSquare([x, y])) {
  //      p5.fill(LIGHT_GREEN);
  //    } else {
  //      p5.fill(DARK_GREEN);
  //    }
  //    const isCastle = move.flags.includes('k') || move.flags.includes('q');
  //    const isCapture = move.flags.includes('c') || move.flags.includes('e');
  //    if (isCastle) {
  //      drawCastleIndicator(x, y, tileSize);
  //    } else if (isCapture) {
  //      drawCaptureTriangles(x, y, tileSize);
  //    } else {
  //      p5.circle(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, tileSize / 3.5);
  //    }
  //  });
  //}

  function drawCastleIndicator(x: number, y: number, tileSize: number) {
    const imageSize = tileSize * 0.8;
    const xPos = x * tileSize + (tileSize - imageSize) / 2;
    const yPos = y * tileSize + (tileSize - imageSize) / 2;
    p5.push();
    p5.tint(255, 255);
    p5.image(castleImage!, xPos, yPos, imageSize, imageSize);
    p5.pop();
  }

  function drawCaptureTriangles(x: number, y: number, tileSize: number) {
    const size = tileSize / 5;
    p5.triangle(
      x * tileSize, y * tileSize,
      x * tileSize + size, y * tileSize,
      x * tileSize, y * tileSize + size
    );
    p5.triangle(
      (x + 1) * tileSize, y * tileSize,
      (x + 1) * tileSize - size, y * tileSize,
      (x + 1) * tileSize, y * tileSize + size
    );
    p5.triangle(
      x * tileSize, (y + 1) * tileSize,
      x * tileSize + size, (y + 1) * tileSize,
      x * tileSize, (y + 1) * tileSize - size
    );
    p5.triangle(
      (x + 1) * tileSize, (y + 1) * tileSize,
      (x + 1) * tileSize - size, (y + 1) * tileSize,
      (x + 1) * tileSize, (y + 1) * tileSize - size
    );
  }

  //function drawCheck() {
  //  if (!store.historyChess.inCheck()) return;
  //  const kingColor = store.historyChess.turn();
  //  const kingSquare = store.historyChess.board().flat().findIndex(p => p && p.type === 'k' && p.color === kingColor);
  //  if (kingSquare === -1) return;
  //  let x = kingSquare % 8;
  //  let y = Math.floor(kingSquare / 8);
  //  if (store.me?.color === 'b') {
  //    x = 7 - x;
  //    y = 7 - y;
  //  }
  //  const tileSize = p5.width / 8;
  //  const buffer = p5.createGraphics(tileSize, tileSize);
  //  buffer.noFill();
  //  const centerX = tileSize / 2;
  //  const centerY = tileSize / 2;
  //  const maxRadius = tileSize / 2 * 1.3;
  //  for (let r = maxRadius; r > 0; r -= 0.5) {
  //    const t = r / maxRadius;
  //    const alpha = p5.map(t, 0, 1, 255, 0);
  //    buffer.stroke(255, 0, 0, alpha);
  //    buffer.strokeWeight(1);
  //    buffer.circle(centerX, centerY, r * 2);
  //  }
  //  p5.image(buffer, x * tileSize, y * tileSize);
  //  buffer.remove();
  //}
  //
  //function drawPromotion() {
  //  if (!store.pendingPromotion || !store.me) return;
  //  const tileSize = canvasSize / 8;
  //  const [x, y] = squareToPosition(store.pendingPromotion.to, store.me.color);
  //  p5.fill(128, 128, 128, 128);
  //  p5.rect(0, 0, canvasSize, canvasSize);
  //  const pieces = ['q', 'r', 'b', 'n'];
  //  pieces.forEach((piece, index) => {
  //    p5.fill(200);
  //    p5.circle(
  //      x * tileSize + tileSize / 2,
  //      (y + index) * tileSize + tileSize / 2,
  //      tileSize
  //    );
  //    const pieceImage = pieceImages[store.me!.color + piece.toUpperCase()];
  //    if (pieceImage) {
  //      const scaledSize = tileSize * 0.8;
  //      const offset = (tileSize - scaledSize) / 2;
  //      p5.image(
  //        pieceImage,
  //        x * tileSize + offset,
  //        (y + index) * tileSize + offset,
  //        scaledSize,
  //        scaledSize
  //      );
  //    }
  //  });
  //}

  //function drawLastMove() {
  //  if (!store.me || store.history.length === 0) return;
  //  const lastMove = store.history[store.inspectedMoveIndex];
  //  if (!lastMove) return;
  //  const tileSize = canvasSize / 8;
  //  p5.noStroke();
  //  [lastMove.from, lastMove.to].forEach(square => {
  //    const [x, y] = squareToPosition(square as Square, store.me!.color);
  //    if (isLightSquare([x, y])) {
  //      p5.fill(LIGHT_HIGHLIGHT);
  //    } else {
  //      p5.fill(DARK_HIGHLIGHT);
  //    }
  //    p5.rect(x * tileSize, y * tileSize, tileSize, tileSize);
  //  });
  //}

  //p5.mousePressed = () => {
  //  if (!store.me || store.modals.startNewGame || store.inspectedMoveIndex !== store.history.length - 1) return;
  //  const tileSize = canvasSize / 8;
  //  const x = Math.floor(p5.mouseX / tileSize);
  //  const y = Math.floor(p5.mouseY / tileSize);
  //
  //  if (store.pendingPromotion) {
  //    const [promotionX, promotionY] = squareToPosition(store.pendingPromotion.to, store.me.color);
  //    if (x !== promotionX) {
  //      store.pendingPromotion = null;
  //      store.selectedSquare = undefined;
  //      return;
  //    }
  //    const pieces = ['q', 'r', 'b', 'n'];
  //    const clickedIndex = y - promotionY;
  //    if (clickedIndex >= 0 && clickedIndex < pieces.length) {
  //      handlePromotion(pieces[clickedIndex]);
  //    } else {
  //      store.pendingPromotion = null;
  //      store.selectedSquare = undefined;
  //    }
  //    return;
  //  }
  //
  //  // Convert mouse position to chess square considering rotation
  //  let fileIndex = x;
  //  let rankIndex = y;
  //  if (store.me.color === 'b' && !store.isBoardRotated ||
  //    store.me.color === 'w' && store.isBoardRotated) {
  //    fileIndex = 7 - x;
  //    rankIndex = 7 - y;
  //  }
  //
  //  const clickedSquare = `${'abcdefgh'[fileIndex]}${8 - rankIndex}` as Square;
  //  selectSquare(clickedSquare);
  //};

  p5.draw = () => {
    p5.background(250);
    drawBoard();
    //drawLastMove();
    //drawCheck();
    //if (store.selectedSquare) {
    //  drawSelectedSquare(store.selectedSquare);
    //  drawPossibleMoves();
    //}
    //drawPieces();
    //if (store.pendingPromotion) {
    //  drawPromotion();
    //}
  };
};

export function Sketch() {
  return (
    <NextReactP5Wrapper
      sketch={sketch}
    />
  );
}

