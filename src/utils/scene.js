export const getScaledScene = (scene, viewport) => {
  return {
    ...scene,
    x: viewport.scale * (scene.x + viewport.x + viewport.width / 2),
    y: viewport.scale * (scene.y + viewport.y + viewport.height / 2),
    width: viewport.scale * scene.width,
    height: viewport.scale * scene.height,
  };
}
