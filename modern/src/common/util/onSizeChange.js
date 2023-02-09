const onSizeChange = (element, callback = () => {}) => {
  const resizeInstance = new ResizeObserver((entries) => {
    // since we are observing only a single element, so we access the first element in entries array
    const rect = entries[0].contentRect;

    // current width & height
    const { width } = rect;
    const { height } = rect;

    callback(width, height);
  });

  resizeInstance.observe(element);
};

export default onSizeChange;
