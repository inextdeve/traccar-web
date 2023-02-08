const onSizeChange = (element, callback = () => {}) => {
  const resize_ob = new ResizeObserver(function (entries) {
    // since we are observing only a single element, so we access the first element in entries array
    let rect = entries[0].contentRect;

    // current width & height
    let width = rect.width;
    let height = rect.height;

    callback(width, height);
  });

  resize_ob.observe(element);
};

export default onSizeChange;
