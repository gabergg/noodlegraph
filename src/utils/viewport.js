export const init = (dimensions) => {
  const {width = 500, height = 500} = dimensions
  
  return {
    x: -width / 2,
    y: -height / 2,
    width,
    height,
    scale: 1,
  };
};

export const move = (viewport, delta) => {
  const {x, y} = delta;

  return {
    ...viewport,
    x: viewport.x + (x / viewport.scale),
    y: viewport.y + (y / viewport.scale),
  };
};

export const resize = (viewport, dimensions) => {
  const {scale} = viewport;
  const {width, height} = dimensions;

  return {
    ...viewport,
    width: width / scale,
    height: height / scale,
  };
};

export const zoomTo = (viewport, newScale) => {
  const {width, height, scale} = viewport;
  const scaleRatio = scale / newScale;

  return {
    ...viewport,
    scale: newScale,
    width: width * scaleRatio,
    height: height * scaleRatio,
  };
};

export const zoom = (viewport, factor) => {
  const {scale} = viewport;
  const newScale = scale * factor;

  return zoomTo(viewport, newScale);
};

