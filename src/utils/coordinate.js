export const transformScene = (scene, viewport) => {
  return {
    ...scene,
    ...transformPoint(scene, viewport),
    width: viewport.scale * scene.width,
    height: viewport.scale * scene.height,
  };
}

export const transformConnection = (connection, viewport) => {

}

export const transformPoint = (point, viewport) => {
  return {
    x: viewport.scale * (point.x + viewport.x + viewport.width / 2),
    y: viewport.scale * (point.y + viewport.y + viewport.height / 2)
  };
}
