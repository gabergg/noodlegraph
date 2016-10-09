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
