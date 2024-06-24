export default function createDrawing(canvas, savedDrawing, save) {
  const ctx = canvas.getContext("2d");
  // a DOMRect object providing information about the size of an element and its position relative to the viewport.
  let rect = canvas.getBoundingClientRect();
  let drawing = false; // 监听鼠标的移动，如果开启了绘制则显示轨迹，否则，不绘制
  let lastX = 0;
  let lastY = 0;
  let drawingData = savedDrawing || null;

  function draw(e) {
    if (!drawing) return;
    const { x, y } = mousePosition(e);
    ctx.beginPath(); // 准备画笔
    ctx.moveTo(lastX, lastY); // 移动到开始的点位
    ctx.lineTo(x, y); // 直线绘制
    ctx.strokeStyle = "#f9f4da";
    ctx.lineCap = "round";
    ctx.lineWidth = 10;
    ctx.stroke(); // 勾勒外形
    [lastX, lastY] = [x, y];
  }

  function mousePosition(e) {
    // e.offsetX 和 e.offsetY：相对于事件目标元素（即 < canvas >）的鼠标位置。这是获取鼠标位置的最直接方式。
    // e.pageX 和 e.pageY：相对于整个文档的鼠标位置。使用这两个值可以在不支持 offsetX 和 offsetY 的浏览器中计算相对位置
    var x = e.offsetX || e.pageX - rect.left;
    var y = e.offsetY || e.pageY - rect.top;
    // canvas.width 和 canvas.height：<canvas> 元素的绘图表面尺寸。
      // canvas.clientWidth 和 canvas.clientHeight：<canvas> 元素在页面上的显示尺寸。
        // ((x * canvas.width) / canvas.clientWidth)：将鼠标在 <canvas> 显示尺寸上的位置转换为 <canvas> 绘图表面上的位置。
          // | 0：按位或运算符，用于快速地将结果取整
    var mouseX = ((x * canvas.width) / canvas.clientWidth) | 0;
    var mouseY = ((y * canvas.height) / canvas.clientHeight) | 0;
    return { x: mouseX, y: mouseY };
  }

  function saveDrawing() {
    // a data URL containing a representation of the image in the format specified by the type parameter.
    drawingData = canvas.toDataURL();
    if (save) {
      // 保存图像信息到 store,
      save(drawingData);
    }
  }

  function endDraw() {
    drawing = false;
    saveDrawing();
  }

  function startDraw(e) {
    drawing = true;
    const { x, y } = mousePosition(e);
    [lastX, lastY] = [x, y];
  }


  // canvas.width 和 canvas.height 属性定义了 canvas 的内部尺寸, 也称为画布尺寸。
  // canvas.style.width 和 canvas.style.height 属性定义了 canvas 的显示尺寸, 也称为CSS尺寸。

  // Use offset * to measure the canvas's display size and adjust its buffer size to match.
  function resize() {
    rect = canvas.getBoundingClientRect();
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  // 将传入的数据进行绘制
  function redraw() {
    const image = new Image();
    image.src = drawingData;
    image.onload = () => {
      // s => source; d => destination
      // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      ctx.drawImage(image, 0, 0);
    };
  }

  function touchstart(event) {
    startDraw(event.touches[0]);
  }

  function touchmove(event) {
    draw(event.touches[0]);
    event.preventDefault();
  }

  function touchend(event) {
    endDraw(event.changedTouches[0]);
  }

  canvas.addEventListener("touchstart", touchstart, false);
  canvas.addEventListener("touchmove", touchmove, false);
  canvas.addEventListener("touchend", touchend, false);
  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", endDraw);
  canvas.addEventListener("mouseout", endDraw);

  // creates a new ResizeObserver object, which can be used to report changes to the content or border box of an Element or the bounding box of an SVGElement.
  new ResizeObserver(resize, canvas);
  redraw();
}

// 绘制的整体思路就是 鼠标按下，开启绘制，移动鼠标，正式绘制，松开鼠标，结束绘制
// 其他的函数都是辅助