import { info } from '../../shared/variables';
import { initializeBackground } from './background';

const rootEl = document.getElementById('root');

let memoizedCanvas: GameCanvas;

export interface GameCanvas {
  ctx: CanvasRenderingContext2D;
  el: HTMLCanvasElement;
  width: number;
  height: number;
}

function createCanvas(): GameCanvas {
  // Clear any existing canvas.
  rootEl.innerHTML = '';

  const canvasEl = document.createElement('canvas');

  const rootHeight = rootEl.offsetHeight;
  const rootWidth = rootEl.offsetWidth;

  canvasEl.setAttribute('width', rootWidth.toString());
  canvasEl.setAttribute('height', rootHeight.toString());

  // TODO: Do this somewhere else!!!!!!!!!!!
  initializeBackground(rootWidth, rootHeight);

  rootEl.append(canvasEl);

  info('canvas created with width of', rootWidth, 'px and height of', rootHeight, 'px');

  return {
    ctx: canvasEl.getContext('2d'),
    el: canvasEl,
    width: rootWidth,
    height: rootHeight,
  };
}

export function getCanvas(): GameCanvas {
  if (memoizedCanvas == null) {
    memoizedCanvas = createCanvas();

    window.addEventListener('resize', () => {
      memoizedCanvas.el.remove();
      info('window resized - creating new canvas');
      memoizedCanvas = createCanvas();
    });
  }

  return memoizedCanvas;
}
