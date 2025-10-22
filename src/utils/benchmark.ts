export const benchmarkCanvas = (elementCount: number) => {
  const renderStart = performance.now();
  const renderTime = performance.now() - renderStart;

  const saveStart = performance.now();
  const saveTime = performance.now() - saveStart;

  console.log(`Elements: ${elementCount}`);
  console.log(`Render time: ${renderTime.toFixed(2)}ms`);
  console.log(`Save time: ${saveTime.toFixed(2)}ms`);
};
