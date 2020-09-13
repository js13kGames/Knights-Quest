import {
  ITEM_ARMOR_HEIGHT,
  ITEM_ARMOR_WIDTH,
  ITEM_BLOOD_HEIGHT,
  ITEM_BLOOD_WIDTH,
  ITEM_HELM_HEIGHT,
  ITEM_HELM_WIDTH,
  ITEM_LIFE_HEIGHT,
  ITEM_LIFE_WIDTH,
  ITEM_SWORD_HEIGHT,
  ITEM_SWORD_WIDTH,
  ITEM_TYPES,
  PLAYER_BOOST_MAX_VAL,
  rad,
  SHOW_BOUNDING_BOXES,
  SHOW_GRID,
  SHOW_PERFORMANCE_METRICS,
} from '../../shared/variables';
import { getPlayerState, getState } from '../state';
import { renderPlayer } from './player';
import { clearCanvas } from './render-utilities';
import { getCanvas } from './canvas';
import { renderBackground } from './background';
import { renderPlayerCoordinatesStats, renderPlayerMouseAngleStats } from './stats';
import { renderMap } from './map';
import { renderGrid } from './grid';
import { renderColliders } from './colliders';
import { renderArmor, renderBlood, renderHealth, renderHelm, renderItem, renderSword } from './item';
import { Quadtree, Rectangle } from '../../server/entities';
import { Player } from '../models/player';
import { renderLeaderboard } from './leaderboard';

export function renderGame() {
  const { ctx, width, height } = getCanvas();
  if (width === 0 || height === 0) {
    return;
  }

  const state = getState();
  if (state == null) {
    return;
  }

  const playerState = getPlayerState();
  if (playerState == null) {
    return;
  }

  const { id, mouseAngleDegrees, x, y } = playerState;

  // Clear canvas.
  clearCanvas(ctx, width, height);

  // Render background.
  renderBackground(ctx, width, height, rad(mouseAngleDegrees), playerState.isBoosting);

  // TODO: This makes me feel like puking. Figure out how to get rid of motion sickness.
  // Render debug grid.
  if (SHOW_GRID) {
    renderGrid(ctx, width, height);
  }

  const screenCoordinate0X = x - width / 2;
  const screenCoordinate0Y = y - height / 2;

  // Render items.
  let itree = new Quadtree();
  Object.keys(state.items).forEach((key: string) =>
    itree.insert(
      new Rectangle(state.items[key].x, state.items[key].y, state.items[key].w, state.items[key].h, state.items[key])
    )
  );

  itree
    .query(new Rectangle(screenCoordinate0X + width / 2, screenCoordinate0Y + height / 2, width / 2, height / 2))
    .forEach((point) => {
      const relativeCoordinateX = point.data.x - screenCoordinate0X;
      const relativeCoordinateY = point.data.y - screenCoordinate0Y;

      if (point.data.type === ITEM_TYPES['armor']) {
        renderArmor(
          ctx,
          relativeCoordinateX,
          relativeCoordinateY,
          point.data.width || ITEM_ARMOR_WIDTH,
          point.data.height || ITEM_ARMOR_HEIGHT
        );
        return;
      }

      if (point.data.type === ITEM_TYPES['helm']) {
        renderHelm(
          ctx,
          relativeCoordinateX,
          relativeCoordinateY,
          point.data.width || ITEM_HELM_WIDTH,
          point.data.height || ITEM_HELM_HEIGHT
        );
        return;
      }

      if (point.data.type === ITEM_TYPES['life']) {
        renderHealth(
          ctx,
          relativeCoordinateX,
          relativeCoordinateY,
          point.data.width || ITEM_LIFE_WIDTH,
          point.data.height || ITEM_LIFE_HEIGHT
        );
        return;
      }

      if (point.data.type === ITEM_TYPES['sword']) {
        renderSword(
          ctx,
          relativeCoordinateX,
          relativeCoordinateY,
          point.data.width || ITEM_SWORD_WIDTH,
          point.data.height || ITEM_SWORD_HEIGHT
        );
        return;
      }

      if (point.data.type === ITEM_TYPES['blood']) {
        renderBlood(
          ctx,
          relativeCoordinateX,
          relativeCoordinateY,
          point.data.width || ITEM_BLOOD_WIDTH,
          point.data.height || ITEM_BLOOD_HEIGHT
        );
        return;
      }

      renderItem(ctx, relativeCoordinateX, relativeCoordinateY, point.data.height);
    });

  // Render players.
  let ptree = new Quadtree();
  Object.keys(state.players).forEach((key: any) =>
    ptree.insert(
      new Rectangle(
        state.players[key].x,
        state.players[key].y,
        state.players[key].width,
        state.players[key].height,
        state.players[key]
      )
    )
  );

  ptree
    .query(new Rectangle(screenCoordinate0X + width / 2, screenCoordinate0Y + height / 2, width / 2, height / 2))
    .forEach((point: { data: Player }) => {
      const relativeCoordinateX = point.data.x - screenCoordinate0X;
      const relativeCoordinateY = point.data.y - screenCoordinate0Y;

      renderPlayer(
        ctx,
        relativeCoordinateX,
        relativeCoordinateY,
        point.data.width,
        point.data.height,
        rad(point.data.mouseAngleDegrees),
        point.data.username,
        Math.round((point.data.boostValue / PLAYER_BOOST_MAX_VAL) * 100),
        point.data.health,
        point.data.id === id ? '#0F9BF2' : '#F25C05',
        'black',
        point.data.level,
        point.data.xp,
        point.data.items
      );

      if (SHOW_BOUNDING_BOXES) {
        renderColliders(ctx, point.data.colliders, screenCoordinate0X, screenCoordinate0Y);
      }
    });

  // Render map.
  renderMap(
    ctx,
    width,
    height,
    { x, y },
    Object.keys(state.players)
      // Map the id to the player object.
      .map((key) => {
        return state.players[key];
      })
      .filter((player) => {
        return player.id !== id;
      })
  );

  // Render leaderboard.
  renderLeaderboard(ctx, width, height, state.leaderboard, playerState.id);

  // Render stats.
  if (SHOW_PERFORMANCE_METRICS) {
    renderPlayerCoordinatesStats(x, y);
    renderPlayerMouseAngleStats(mouseAngleDegrees);
  }
}
