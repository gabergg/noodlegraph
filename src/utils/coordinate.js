export const transformSceneToViewport = (scene, viewport) => {
  return {
    ...scene,
    ...transformPointToViewport(scene, viewport),
    width: viewport.scale * scene.width,
    height: viewport.scale * scene.height,
  };
}

export const transformConnectionToViewport = (connection, viewport) => {
  return {
    ...connection,
    startX: viewport.scale * (connection.startX + viewport.x + viewport.width / 2),
    startY: viewport.scale * (connection.startY + viewport.y + viewport.height / 2),
  };
}

export const transformPointToViewport = (point, viewport) => {
  return {
    x: viewport.scale * (point.x + viewport.x + viewport.width / 2),
    y: viewport.scale * (point.y + viewport.y + viewport.height / 2)
  };
}

export const transformPointToParent = (point, viewport) => {
  return {
    x: (point.x / viewport.scale) - viewport.x - (viewport.width / 2),
    y: (point.y / viewport.scale) - viewport.y - (viewport.height / 2),
  };
}
