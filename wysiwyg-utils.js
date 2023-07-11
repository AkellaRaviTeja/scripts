export const onMouseOver = (e) => {
  if (e.target) {
    const { classList } = e.target;
    const isApxor =
      classList.contains("apx-highlight") ||
      classList.toString().indexOf("apx-") !== -1;

    if (classList && !isApxor) {
      e.target.classList.add("apx-highlight");
      e.target.oldOnClick = e.target.onclick;
      e.target.onclick = null;
    }
  }
};

export const onMouseOut = (e) => {
  if (e.target) {
    if (e.target.classList && e.target.classList.contains("apx-highlight")) {
      e.target.classList.remove("apx-highlight");
      e.target.onclick = e.target.oldOnClick;
      e.target.oldOnClick = null;
    }
  }
};

export const handleDocumentOnClick = (e, callback) => {
  const target = e.target;
  if (target && target.classList.contains("apx-highlight")) {
    e.preventDefault();
    e.stopPropagation();

    target.classList.remove("apx-highlight");
    target.onclick = target.oldOnClick;
    target.oldOnClick = null;

    if (callback) {
      callback(target);
    }
  }
};

export function dragElement(elmnt) {
  let PADDING = 8;

  let rect;
  let viewport = {
    bottom: window.innerHeight - PADDING,
    left: PADDING,
    right: window.innerWidth - PADDING,
    top: PADDING,
  };

  let xPos = 0,
    yPos = 0,
    oldX = 0,
    oldY = 0;
  const dragEle = document.getElementById(elmnt.id + "-h");
  if (dragEle) {
    dragEle.addEventListener("mousedown", dragMouseDown);
    dragEle.addEventListener("touchstart", dragMouseDown, { passive: false });
  } else {
    elmnt.addEventListener("mousedown", dragMouseDown);
    elmnt.addEventListener("touchstart", dragMouseDown, { passive: false });
  }

  function dragMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    e = e || window.event;

    if (e.type === "touchstart") {
      oldX = e.targetTouches[0].pageX;
      oldY = e.targetTouches[0].pageY;
    } else {
      oldX = e.clientX;
      oldY = e.clientY;
    }

    rect = elmnt.getBoundingClientRect();

    document.addEventListener("mouseup", closeDragElement);
    document.addEventListener("touchend", closeDragElement, { passive: false });
    document.addEventListener("mousemove", elementDrag);
    document.addEventListener("touchmove", elementDrag, { passive: false });
  }

  function elementDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    e = e || window.event;
    // calculate the new cursor position:

    if (e.type === "touchmove") {
      xPos = oldX - e.targetTouches[0].pageX;
      yPos = oldY - e.targetTouches[0].pageY;
      oldX = e.targetTouches[0].pageX;
      oldY = e.targetTouches[0].pageY;
    } else {
      xPos = oldX - e.clientX;
      yPos = oldY - e.clientY;
      oldX = e.clientX;
      oldY = e.clientY;
    }

    const newLeft = elmnt.offsetLeft - xPos;
    const newTop = elmnt.offsetTop - yPos;

    if (
      newLeft < viewport.left ||
      newTop < viewport.top ||
      newLeft + rect.width > viewport.right ||
      newTop + rect.height > viewport.bottom
    ) {
      // the element will hit the boundary, do nothing...
    } else {
      elmnt.style.top = elmnt.offsetTop - yPos + "px";
      elmnt.style.left = elmnt.offsetLeft - xPos + "px";
      elmnt.style.right = "";
    }
  }

  function closeDragElement() {
    document.removeEventListener("mouseup", closeDragElement);
    document.removeEventListener("touchend", closeDragElement);
    document.removeEventListener("mousemove", elementDrag);
    document.removeEventListener("touchmove", elementDrag);
  }
}
