const APX_OVERLAY = "apx-oly";
const APX_DIALOG_CONTENT = "apx-dlg-c";
const FRONTEND_API = "https://server.apxor.com/v4/frontendapi/web/test-devices";
const ADD_TEST_DEVICE_API = FRONTEND_API + "?appId=b0bf1fc7-b104-4e92-9cc5-590fcb685c29";
const ON_HTML = "<b>View Selection Mode: ON";
const OFF_HTML = "<b>View Selection Mode: OFF</b>";

let _styleNode = null, _viewPickerNode = null,_addRemoveTestDeviceDialog = null,  _wysiwygRoot = null,_vid = "";

let testDeviceData,isSelectionMode;
const onMouseOver = (e) => {
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

const onMouseOut = (e) => {
  if (e.target) {
    if (e.target.classList && e.target.classList.contains("apx-highlight")) {
      e.target.classList.remove("apx-highlight");
      e.target.onclick = e.target.oldOnClick;
      e.target.oldOnClick = null;
    }
  }
};

const handleDocumentOnClick = (e, callback) => {
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

function dragElement(elmnt) {
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

const cssPath = (node, optimized) => {
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  var steps = [];
  var contextNode = node;
  while (contextNode) {
    var step = _cssPathStep(
      contextNode,
      !!optimized,
      contextNode === node
    );
    if (!step) break; // Error - bail out early.
    steps.push(step);
    if (step.optimized) break;
    contextNode = contextNode.parentNode;
  }
  steps.reverse();
  return steps.join(" > ");
};

const _cssPathStep = (node, optimized, isTargetNode) => {
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const id = node.getAttribute("id");
  if (optimized) {
    if (id) return new DOMNodePathStep(idSelector(id), true);
    var nodeNameLower = node.nodeName.toLowerCase();
    if (
      nodeNameLower === "body" ||
      nodeNameLower === "head" ||
      nodeNameLower === "html"
    )
      return new DOMNodePathStep(node.nodeName.toLowerCase(), true);
  }
  var nodeName = node.nodeName.toLowerCase();

  if (id)
    return new DOMNodePathStep(nodeName.toLowerCase() + idSelector(id), true);
  var parent = node.parentNode;
  if (!parent || parent.nodeType === Node.DOCUMENT_NODE)
    return new DOMNodePathStep(nodeName.toLowerCase(), true);

  function prefixedElementClassNames(node) {
    var classAttribute = node.getAttribute("class");
    if (!classAttribute) return [];

    return classAttribute
      .split(/\s+/g)
      .filter(Boolean)
      .map(function (name) {
        // The prefix is required to store "__proto__" in a object-based map.
        return "$" + name;
      });
  }

  function idSelector(id) {
    return "#" + escapeIdentifierIfNeeded(id);
  }

  function escapeIdentifierIfNeeded(ident) {
    if (isCSSIdentifier(ident)) return ident;
    var shouldEscapeFirst = /^(?:[0-9]|-[0-9-]?)/.test(ident);
    var lastIndex = ident.length - 1;
    return ident.replace(/./g, function (c, i) {
      return (shouldEscapeFirst && i === 0) || !isCSSIdentChar(c)
        ? escapeAsciiChar(c, i === lastIndex)
        : c;
    });
  }

  function escapeAsciiChar(c, isLast) {
    return "\\" + toHexByte(c) + (isLast ? "" : " ");
  }

  function toHexByte(c) {
    var hexByte = c.charCodeAt(0).toString(16);
    if (hexByte.length === 1) hexByte = "0" + hexByte;
    return hexByte;
  }

  function isCSSIdentChar(c) {
    if (/[a-zA-Z0-9_-]/.test(c)) return true;
    return c.charCodeAt(0) >= 0xa0;
  }

  function isCSSIdentifier(value) {
    return /^-?[a-zA-Z_][a-zA-Z0-9_-]*$/.test(value);
  }

  var prefixedOwnClassNamesArray = prefixedElementClassNames(node);
  var needsClassNames = false;
  var needsNthChild = false;
  var ownIndex = -1;
  var elementIndex = -1;
  var siblings = parent.children;
  for (
    var i = 0;
    (ownIndex === -1 || !needsNthChild) && i < siblings.length;
    ++i
  ) {
    var sibling = siblings[i];
    if (sibling.nodeType !== Node.ELEMENT_NODE) continue;

    elementIndex += 1;
    if (sibling === node) {
      ownIndex = elementIndex;
      continue;
    }
    if (needsNthChild) continue;
    if (sibling.nodeName.toLowerCase() !== nodeName.toLowerCase()) continue;

    needsClassNames = true;
    var ownClassNames = new Set(prefixedOwnClassNamesArray);
    if (!ownClassNames.size) {
      needsNthChild = true;
      continue;
    }

    var siblingClassNamesArray = prefixedElementClassNames(sibling);
    for (var j = 0; j < siblingClassNamesArray.length; ++j) {
      var siblingClass = siblingClassNamesArray[j];
      if (!ownClassNames.has(siblingClass)) continue;
      ownClassNames.delete(siblingClass);
      if (!ownClassNames.size) {
        needsNthChild = true;
        break;
      }
    }
  }

  var result = nodeName.toLowerCase();
  if (
    isTargetNode &&
    nodeName.toLowerCase() === "input" &&
    node.getAttribute("type") &&
    !node.getAttribute("id") &&
    !node.getAttribute("class")
  )
    result += '[type="' + node.getAttribute("type") + '"]';
  if (needsNthChild) {
    result += ":nth-child(" + (ownIndex + 1) + ")";
  } else if (needsClassNames) {
    for (var prefixedName in prefixedOwnClassNamesArray)
      result +=
        "." +
        escapeIdentifierIfNeeded(
          prefixedOwnClassNamesArray[prefixedName].substr(1)
        );
  }

  return new DOMNodePathStep(result, false);
};

const xPath = (node, optimized) => {
  if (node.nodeType === Node.DOCUMENT_NODE) return "/";
  var steps = [];
  var contextNode = node;
  while (contextNode) {
    var step = _xPathValue(contextNode, optimized);
    if (!step) break; // Error - bail out early.
    steps.push(step);
    if (step.optimized) break;
    contextNode = contextNode.parentNode;
  }
  steps.reverse();
  return (steps.length && steps[0].optimized ? "" : "/") + steps.join("/");
};

const _xPathValue = (node, optimized) => {
  var ownValue;
  var ownIndex = _xPathIndex(node);
  if (ownIndex === -1) return null; // Error.
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      if (optimized && node.getAttribute("id"))
        return new DOMNodePathStep(
          '//*[@id="' + node.getAttribute("id") + '"]',
          true
        );
      ownValue = node.localName;
      break;
    case Node.ATTRIBUTE_NODE:
      ownValue = "@" + node.nodeName;
      break;
    case Node.TEXT_NODE:
    case Node.CDATA_SECTION_NODE:
      ownValue = "text()";
      break;
    case Node.PROCESSING_INSTRUCTION_NODE:
      ownValue = "processing-instruction()";
      break;
    case Node.COMMENT_NODE:
      ownValue = "comment()";
      break;
    case Node.DOCUMENT_NODE:
      ownValue = "";
      break;
    default:
      ownValue = "";
      break;
  }
  if (ownIndex > 0) ownValue += "[" + ownIndex + "]";
  return new DOMNodePathStep(ownValue, node.nodeType === Node.DOCUMENT_NODE);
};

const _xPathIndex = (node) => {
  // Returns -1 in case of error, 0 if no siblings matching the same expression, <XPath index among the same expression-matching sibling nodes> otherwise.
  function areNodesSimilar(left, right) {
    if (left === right) return true;
    if (
      left.nodeType === Node.ELEMENT_NODE &&
      right.nodeType === Node.ELEMENT_NODE
    )
      return left.localName === right.localName;
    if (left.nodeType === right.nodeType) return true;
    // XPath treats CDATA as text nodes.
    var leftType =
      left.nodeType === Node.CDATA_SECTION_NODE
        ? Node.TEXT_NODE
        : left.nodeType;
    var rightType =
      right.nodeType === Node.CDATA_SECTION_NODE
        ? Node.TEXT_NODE
        : right.nodeType;
    return leftType === rightType;
  }
  var siblings = node.parentNode ? node.parentNode.children : null;
  if (!siblings) return 0; // Root node - no siblings.
  var hasSameNamedElements;
  for (var i = 0; i < siblings.length; ++i) {
    if (areNodesSimilar(node, siblings[i]) && siblings[i] !== node) {
      hasSameNamedElements = true;
      break;
    }
  }
  if (!hasSameNamedElements) return 0;
  var ownIndex = 1; // XPath indices start with 1.
  for (var j = 0; j < siblings.length; ++j) {
    if (areNodesSimilar(node, siblings[j])) {
      if (siblings[j] === node) return ownIndex;
      ++ownIndex;
    }
  }
  return -1; // An error occurred: |node| not found in parent's children.
};
const _showAddTestDeviceDialog = (rtmInstance) => {
  const dialog = createDialog(500, 20, {});
  const dialogContent = dialog.children[0];
  dialogContent.style.flex = "0 1 auto";
  dialogContent.style.maxHeight = "calc(100% - 96px)";
  dialogContent.style.display = "flex";
  dialogContent.style.flexDirection = "column";

  const deviceInfo = Apxor.getController().getDevInfo();
  const { apx_browser } = Apxor.getController().getUserAttributes();
  const { hardware_model, os_version, id } = deviceInfo;

  const styles = `<style>
      .apx-loading{
        background:#333 url('https://code.jquery.com/mobile/1.3.1/images/ajax-loader.gif') no-repeat 50% 50%;
        -webkit-transition:background-color 0;transition:background-color 0;opacity: 1;
        -webkit-transition:opacity 1;transition:opacity 1
      }
      .apx-t{
        flex:0 0 auto;
        margin:0;
        padding:24px 24px 20px
      }
      .apx-tt{
        color:rgba(0,72,114,0.87);
        font-size:1.3125rem;
        font-weight:500;
        font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
        line-height: 1.16667em;
        margin:0
      }
      .apx-c{
        flex:1 1 auto;padding:0 24px 24px;overflow-y: auto
      }
      .apx-de{
        line-height:1.5;color:rgba(0,72,114,0.54);font-size:1rem;font-weight:400;
        font-family:"Roboto", "Helvetica", "Arial", sans-serif;margin:0;display:block
      }
      .apx-id{
        width:100%;margin-top:8px;margin-bottom:4px;margin:0;border:0;flex-direction:column;
        display:inline-flex;padding:0;position:relative;min-width:0;vertical-align:top
      }
      .apx-il{
        transition:color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms;
        transform:translate(0, 21px) scale(1);top:0;left:0;position:absolute;
        color:rgba(0,72,114, 0.54);padding: 0;font-size: 1rem;transform-origin:top left;
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;line-height: 1
      }
      .apx-il-f{
        transform:translate(0, 1.5px) scale(0.75)
      }
      label + .apx-iid {
        margin-top:16px;position:relative;width: 100%;color: rgba(0,72,114, 0.87);
        cursor: text;display: inline-flex;font-size: 1rem;
        font-family:"Roboto", "Helvetica", "Arial", sans-serif;
        line-height: 1.1875em;align-items: center
      }
      .apx-iid.apx-iid-f:after{
        transform:scaleX(1)
      }
      .apx-iid:hover:before{
        border-bottom: 2px solid rgba(0,72,114, 0.87)
      }
      .apx-iid:before{
        left: 0;right: 0;bottom: 0;content: '\\00a0';position: absolute;
        transition: border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        border-bottom: 1px solid rgba(0, 0, 0, 0.42);pointer-events: none
      }
      .apx-iid:after{
        left: 0;right: 0;bottom: 0;content: "";position: absolute;transform: scaleX(0);
        transition: transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms;
        border-bottom: 2px solid rgb(44, 56, 126);pointer-events: none
      }
      .apx-ii{
        padding-top:3px;font: inherit;color: currentColor;width: 100%;border: 0;margin: 0;
        display: block;min-width: 0;box-sizing: content-box;background: none;padding: 6px 0 7px;outline:0
      }
      .apx-ul{
        padding-top:8px;padding-bottom:8px;margin:0;padding:0;position:relative;list-style:none
      }
      .apx-li{
        padding-left:16px;padding-right:16px;width:100%;display:flex;list-style:none;
        position:relative;box-sizing:border-box;text-align:left;align-items:center;
        padding-top:11px;padding-bottom:11px;justify-content:flex-start;text-decoration:none
      }
      .apx-lid:first-child{
        padding-left:0
      }
      .apx-lid{
        flex:1 1 auto;padding:0 16px;min-width:0
      }
      .apx-lids{
        color:rgba(0,72,114, 0.87);font-weight:400;line-height:1.5em;
        font-family:"Roboto", "Helvetica", "Arial", sans-seriffont-size:1rem
      }
      .apx-a{
        flex:0 0 auto;margin:8px 4px;display:flex;align-items:center;justify-content:flex-end
      }
      .apx-b{
        font-size:0.875rem;min-width:64px;box-sizing:border-box;min-height:36px;border:0;
        transition:background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        line-height:1.3125;font-weight:500;font-family:"Roboto", "Helvetica", "Arial", sans-serif;
        border-radius:4px;text-transform:uppercase;cursor:pointer;display:inline-flex;outline:none;
        position:relative;align-items:center;user-select:none;vertical-align:middle;
        justify-content:center;text-decoration:none;background-color:transparent
      }
      .apx-bl{
        width: 100%;display:inherit;align-items:inherit;justify-content:inherit
      }
      .apx-btr{
        top:0;left:0;width:100%;height:100%;display:block;z-index:0;position:absolute;
        overflow:hidden;border-radius:inherit;pointer-events:none
      }
    </style>
  `;

  const html = `
      ${styles}
      <div>
        <div class="apx-t"><h2 class="apx-tt">Set device nick name</h2></div>
        <div class="apx-c">
          <p class="apx-de">Give this device a nick name for easy identification</p>
          <div class="apx-id">
            <label class="apx-il">Nick name</label>
            <div class="apx-iid">
              <input class="apx-ii" type="text" id="apx-ii" value="">
            </div>
          </div>
          <ul class="apx-ul">
            <li class="apx-li">
              <div class="apx-lid">
                <span class="apx-lids">
                  <span>Model <strong style="float:right">${hardware_model} - ${os_version}</strong></span>
                </span>
              </div>
            </li>
            <li class="apx-li">
              <div class="apx-lid">
                <span class="apx-lids">
                  <span>Browser <strong style="float:right">${apx_browser}</strong></span>
                </span>
              </div>
            </li>
            <li class="apx-li">
              <div class="apx-lid">
                <span class="apx-lids">
                  <span>Device ID <strong style="float:right">${id}</strong></span>
                </span>
              </div>
            </li>
          </ul>
        </div>
        <div class="apx-a">
        <button id="apx-bc" class="apx-b"><span class="apx-bl" style="color:#295e8c6b">Cancel</span><span class="apx-btr"/></button>
        <button id="apx-bd" class="apx-b"><span class="apx-bl" style="color:#295e8c">Done</span><span class="apx-btr"/></button>
        </div>
      </div>
  `;

  dialog.style.visibility = "hidden";
  dialogContent.style.visibility = "hidden";
  dialogContent.innerHTML = html;

  const input = document.getElementById("apx-ii");
  if (testDeviceData) {
    input.value = testDeviceData?.name ?? "";
  }

  input.onfocus = () => {
    input.parentNode.classList.add("apx-iid-f");
    input.parentNode.parentNode.children[0].classList.add("apx-il-f");
  };
  input.onblur = () => {
    input.parentNode.classList.remove("apx-iid-f");
    input.parentNode.parentNode.children[0].classList.remove("apx-il-f");
  };
  input.oninput = () => {
    if (input.value.trim() !== "") {
      done.removeAttribute("disabled");
    } else {
      done.setAttribute("disabled", "");
    }
  };

  // Show the dialog with some timeout to animate the dialog
  setTimeout(() => {
    dialog.style.visibility = "visible";
    dialogContent.style.visibility = "visible";

    dialogContent.classList.toggle("open");

    input.parentNode.parentNode.children[0].classList.add("apx-il-f");
  }, 100);

  const hideDialog = () => {
    dialogContent.classList.toggle("open");
    setTimeout(() => {
      dialog.parentNode.removeChild(dialog);
    }, 400);
  };

  const cancel = document.getElementById("apx-bc");
  cancel.onclick = () => {
    hideDialog();
  };

  const done = document.getElementById("apx-bd");
  done.onclick = () => {
    // Make Add Test Device network request
    dialogContent.children[1].classList.add("apx-loading");
    Apxor.getController().makePostRequest(
      ADD_TEST_DEVICE_API.replace("<aid>", Apxor.getSiteId()),
      {
        model: hardware_model,
        id,
        nick_name: input.value,
      },
      {
        apx_web_key: "WTCKFAIVAJKYJA3HCV80WIKZU98R9NJG",
      },
      () => {
        const newInfo = { id, name: input.value };
        Apxor.getController().persistToStorage("_apx_td", newInfo, true);

        testDeviceData = newInfo;

        _makeSSERequest("select", `${input.value} - ${id}`, id, () => {
          dialogContent.children[1].classList.remove("apx-loading");
          _wysiwygRoot.dispatchEvent(new CustomEvent("added"));
        });

        const previewEventSource = new EventSource(
          PREVIEW_API.replace("<aid>", Apxor.getSiteId()).replace("<uid>", id)
        );
        const artConfigEventSource = new EventSource(
          CONFIG_API.replace("<aid>", Apxor.getSiteId()).replace("<uid>", id)
        );
        previewEventSource.onmessage = artConfigEventSource.onmessage = (
          e
        ) => {
          if (e && e.data && e.data !== "{}") {
            _handleSSEResponse(rtmInstance, e.data);
          }
        };

        hideDialog();
      },
      () => {}
    );
  };
};
const _createDraggableWYSIWYGOverlay = (rtmInstance) => {
  console.log("Created a WYSIWYG popup");
  const isAdded =
    testDeviceData !== null &&
    testDeviceData !== undefined &&
    testDeviceData.id &&
    testDeviceData.name;

  const html = `
        <style>
            .apx-cr{
              display:flex;
              justify-content:center;
              align-items:center;
              flex-direction:column;
              gap:10px
            }
            .apx-b{
              border:none;
              font-size:16px;
              font-family:inherit;
              padding:8px 14px;
              cursor:pointer
            }
            .apx-close:before{
              content:'\\58';
              font-size:9px;
              color:#969696;
              cursor:pointer;
              position:absolute;
              top:1px;
              right:3px
            }
        </style>
        <div>
            <svg class="apx-" id="apx-wr-h" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="280.6027397260274 189.52023061718432 89.75342465753425 54.49346801295263" width="60" height="40" style="width:40px;position:absolute;top:17px;left:50%;transform:translate(-50%, -50%);cursor:move;">
            <defs>
              <path
                d="M304.6 201.52C304.6 208.14 299.23 213.52 292.6 213.52C285.98 213.52 280.6 208.14 280.6 201.52C280.6 194.9 285.98 189.52 292.6 189.52C299.23 189.52 304.6 194.9 304.6 201.52Z"
                id="e2aMl5NH8S"
              />
              <path
                d="M324.9 189.54C331.52 189.16 337.2 194.21 337.58 200.82C337.97 207.43 332.91 213.12 326.3 213.5C319.69 213.89 314.01 208.83 313.62 202.22C313.24 195.61 318.29 189.93 324.9 189.54Z"
                id="e2L4sySuvL"
              />
              <path
                d="M304.6 232.01C304.6 225.39 299.23 220.01 292.6 220.01C285.98 220.01 280.6 225.39 280.6 232.01C280.6 238.64 285.98 244.01 292.6 244.01C299.23 244.01 304.6 238.64 304.6 232.01Z"
                id="a5AJxVSDw"
              />
              <path
                d="M337.6 232.01C337.6 225.39 332.23 220.01 325.6 220.01C318.98 220.01 313.6 225.39 313.6 232.01C313.6 238.64 318.98 244.01 325.6 244.01C332.23 244.01 337.6 238.64 337.6 232.01Z"
                id="bjnangUBy"
              />
              <path
                d="M370.36 232.01C370.36 225.39 364.98 220.01 358.36 220.01C351.73 220.01 346.36 225.39 346.36 232.01C346.36 238.64 351.73 244.01 358.36 244.01C364.98 244.01 370.36 238.64 370.36 232.01Z"
                id="a8aeEZTAL0"
              />
              <path
                d="M369.36 201.52C369.36 194.9 363.98 189.52 357.36 189.52C350.73 189.52 345.36 194.9 345.36 201.52C345.36 208.14 350.73 213.52 357.36 213.52C363.98 213.52 369.36 208.14 369.36 201.52Z"
                id="a4VJpGfPPp"
              />
            </defs>
            <g>
              <g>
                <g>
                  <use xlink:href="#e2aMl5NH8S" opacity="1" fill="#000000"  fill-opacity="1" />
                </g>
                <g>
                  <use xlink:href="#e2L4sySuvL" opacity="1" fill="#000000" fill-opacity="1"/>
                </g>
                <g>
                  <use xlink:href="#a5AJxVSDw" opacity="1" fill="#000000" fill-opacity="1"/>
                </g>
                <g>
                  <use xlink:href="#bjnangUBy" opacity="1" fill="#000000" fill-opacity="1"/>
                </g>
                <g>
                  <use xlink:href="#a8aeEZTAL0" opacity="1" fill="#000000" fill-opacity="1"/>
                </g>
                <g>
                  <use xlink:href="#a4VJpGfPPp" opacity="1" fill="#000000" fill-opacity="1"/>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <div class="apx-cr" style="gap:0;margin-top:20px;margin-bottom=20px;">
          <img class="apx-" width="54" height="54" src="https://f.hubspotusercontent10.net/hub/5329664/hubfs/Apxor%20X%20logo.png?width=108&height=108" />
        </div>
        <div id="apx-bh" class="apx-cr apx-bh" style="padding:8px 20px;">
          <button class="apx-b" id="apx-a" style="display:${
            isAdded ? "none" : "block"
          }">
              Add as test device
          </button>
          <button class="apx-b" id="apx-r" style="display:${
            isAdded ? "block" : "none"
          }">
              Remove as test device
          </button>
          <button class="apx-b" id="apx-ev" style="display:${
            isAdded && isSelectionMode
              ? "none"
              : isAdded
              ? "block"
              : "none"
          }">
              Enable view selection
          </button>
          <button class="apx-b" id="apx-dv" style="display:${
            isAdded && isSelectionMode ? "block" : "none"
          }">
              Disable view selection
          </button>
        </div>
    `;

  //Remove the overlay if its already created.
  const wysiwyg_overlay = document.getElementById("apx-wr");
  if (wysiwyg_overlay && wysiwyg_overlay.remove) {
    wysiwyg_overlay.remove();
  }

  const node = document.createElement("div");
  node.style = `
      z-index:99999999;
      position:fixed;
      top:8px;
      right:8px;
      background:white;
      box-shadow:0px 0px 7px 7px black;
      border-radius:3px;
      padding:20px;
      border: 5px solid rgba(0, 0, 0, 0.7);
    `;
  node.setAttribute("id", "apx-wr");
  node.innerHTML = html;

  document.body.appendChild(node);
  _wysiwygRoot = node;

  const buttons = document.getElementById("apx-bh");

  const hide = () => {
    node.style.opacity = 0.5;
    buttons.style.display = "none";
  };
  let timeoutHandler = setTimeout(hide, 3000);

  // Upon mouseout of this div, show the buttons and reset the opacity back to 1
  node.addEventListener("mouseover", () => {
    node.style.opacity = 1;
    clearTimeout(timeoutHandler);
    buttons.style.display = "flex";
  });

  // Upon mouseout of this div, hide the buttons and decrease the opacity to 0.5
  node.addEventListener("mouseout", () => {
    timeoutHandler = setTimeout(hide, 3000);
  });

  const addDeviceButton = document.getElementById("apx-a");
  const removeDeviceButton = document.getElementById("apx-r");
  const enableViewSelectionButton = document.getElementById("apx-ev");
  const disableViewSelectionButton = document.getElementById("apx-dv");

  addDeviceButton.onclick = () => _showAddTestDeviceDialog(rtmInstance);

  removeDeviceButton.onclick = () => {
    // Make remove API call
    fetch(
      REMOVE_TEST_DEVICE_API.replace("<aid>", Apxor.getSiteId()).replace(
        "<uid>",
        testDeviceData.id
      ),
      {
        method: "DELETE",
        headers: {
          apx_web_key: "WTCKFAIVAJKYJA3HCV80WIKZU98R9NJG",
        },
      }
    )
      .then((res) => {
        if (res.ok && res.status === 200) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data) {
          Apxor.getController().persistToStorage("_apx_td", {}, true);
          testDeviceData = null;

          addDeviceButton.style.display = "block";
          removeDeviceButton.style.display =
            enableViewSelectionButton.style.display =
            disableViewSelectionButton.style.display =
              "none";

          if (isSelectionMode) {
            _hideSelectionMode();
          }
        }
      })
      .catch((e) => console.error(e));
  };

  /**
   * Hides this button, Shows the Disable View Selection button and attach some event listeners
   *
   * At last, show a toast kind of message at the center of the screen
   */
  enableViewSelectionButton.onclick = () => {
    isSelectionMode = true;

    // Attach the mouseover and mouseout listeners
    window.addEventListener("mouseover", onMouseOver, true);
    window.addEventListener("mouseout", onMouseOut, true);
    clickListener = (e) =>
      handleDocumentOnClick(e, (target) => {
        // Send this information over to SSE server which will send this info to dashboard
        const cssSelector = cssPath(target, true);
        const xPath = xPath(target, true);
        //copying value to the clipboard
        navigator.clipboard.writeText(cssSelector + "___" + xPath);
        //creating container for indicating user to paste the code in dashboard
        showFeedbackAfterViewIdCopy();
        //disabling the view seletion after showing the container
        disableViewSelectionHandler();
        _makeSSERequest(
          "view",
          location.href,
          cssSelector + "___" + xPath
        );
      });
    window.addEventListener("click", clickListener, true);

    _hideToast(false);

    enableViewSelectionButton.style.display = "none";
    disableViewSelectionButton.style.display = "block";
  };

  const showFeedbackAfterViewIdCopy = () => {
    const enableViewSelectionBtn = document.querySelector("#apx-ev");
    enableViewSelectionBtn.disabled = true;

    let message =
      "ID Copied! Now go back to apxor dashboard and paste <br> the element ID";

    let uiElementPasteSVG = `
        <svg width="447" height="144" viewBox="0 0 447 144" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="447" height="144" fill="white"/>
          <path d="M24.84 35V26.36H28.488C28.572 26.36 28.684 26.364 28.824 26.372C28.968 26.376 29.096 26.388 29.208 26.408C29.724 26.488 30.146 26.658 30.474 26.918C30.806 27.178 31.05 27.506 31.206 27.902C31.362 28.294 31.44 28.732 31.44 29.216C31.44 29.7 31.36 30.14 31.2 30.536C31.044 30.928 30.8 31.254 30.468 31.514C30.14 31.774 29.72 31.944 29.208 32.024C29.096 32.04 28.968 32.052 28.824 32.06C28.68 32.068 28.568 32.072 28.488 32.072H26.472V35H24.84ZM26.472 30.548H28.416C28.5 30.548 28.592 30.544 28.692 30.536C28.792 30.528 28.884 30.512 28.968 30.488C29.188 30.428 29.358 30.328 29.478 30.188C29.598 30.044 29.68 29.886 29.724 29.714C29.772 29.538 29.796 29.372 29.796 29.216C29.796 29.06 29.772 28.896 29.724 28.724C29.68 28.548 29.598 28.39 29.478 28.25C29.358 28.106 29.188 28.004 28.968 27.944C28.884 27.92 28.792 27.904 28.692 27.896C28.592 27.888 28.5 27.884 28.416 27.884H26.472V30.548ZM32.767 35L35.407 26.36H37.843L40.483 35H38.803L36.451 27.38H36.763L34.447 35H32.767ZM34.351 33.2V31.676H38.911V33.2H34.351ZM45.9081 35.18C45.2681 35.18 44.6901 35.068 44.1741 34.844C43.6621 34.616 43.2401 34.292 42.9081 33.872C42.5801 33.448 42.3721 32.944 42.2841 32.36L43.9881 32.108C44.1081 32.604 44.3561 32.986 44.7321 33.254C45.1081 33.522 45.5361 33.656 46.0161 33.656C46.2841 33.656 46.5441 33.614 46.7961 33.53C47.0481 33.446 47.2541 33.322 47.4141 33.158C47.5781 32.994 47.6601 32.792 47.6601 32.552C47.6601 32.464 47.6461 32.38 47.6181 32.3C47.5941 32.216 47.5521 32.138 47.4921 32.066C47.4321 31.994 47.3461 31.926 47.2341 31.862C47.1261 31.798 46.9881 31.74 46.8201 31.688L44.5761 31.028C44.4081 30.98 44.2121 30.912 43.9881 30.824C43.7681 30.736 43.5541 30.61 43.3461 30.446C43.1381 30.282 42.9641 30.066 42.8241 29.798C42.6881 29.526 42.6201 29.184 42.6201 28.772C42.6201 28.192 42.7661 27.71 43.0581 27.326C43.3501 26.942 43.7401 26.656 44.2281 26.468C44.7161 26.28 45.2561 26.188 45.8481 26.192C46.4441 26.2 46.9761 26.302 47.4441 26.498C47.9121 26.694 48.3041 26.98 48.6201 27.356C48.9361 27.728 49.1641 28.184 49.3041 28.724L47.5401 29.024C47.4761 28.744 47.3581 28.508 47.1861 28.316C47.0141 28.124 46.8081 27.978 46.5681 27.878C46.3321 27.778 46.0841 27.724 45.8241 27.716C45.5681 27.708 45.3261 27.744 45.0981 27.824C44.8741 27.9 44.6901 28.012 44.5461 28.16C44.4061 28.308 44.3361 28.484 44.3361 28.688C44.3361 28.876 44.3941 29.03 44.5101 29.15C44.6261 29.266 44.7721 29.36 44.9481 29.432C45.1241 29.504 45.3041 29.564 45.4881 29.612L46.9881 30.02C47.2121 30.08 47.4601 30.16 47.7321 30.26C48.0041 30.356 48.2641 30.492 48.5121 30.668C48.7641 30.84 48.9701 31.068 49.1301 31.352C49.2941 31.636 49.3761 31.996 49.3761 32.432C49.3761 32.896 49.2781 33.302 49.0821 33.65C48.8901 33.994 48.6301 34.28 48.3021 34.508C47.9741 34.732 47.6021 34.9 47.1861 35.012C46.7741 35.124 46.3481 35.18 45.9081 35.18ZM54.0188 35V27.884H51.2948V26.36H58.3748V27.884H55.6508V35H54.0188ZM60.6591 35V26.36H66.2991V27.884H62.2911V29.732H65.5791V31.256H62.2911V33.476H66.2991V35H60.6591ZM76.2955 35.18C75.5995 35.18 74.9875 35.04 74.4595 34.76C73.9315 34.476 73.5195 34.078 73.2235 33.566C72.9275 33.054 72.7795 32.452 72.7795 31.76V26.372L74.4355 26.36V31.748C74.4355 32.032 74.4835 32.29 74.5795 32.522C74.6755 32.754 74.8075 32.954 74.9755 33.122C75.1475 33.29 75.3455 33.42 75.5695 33.512C75.7975 33.6 76.0395 33.644 76.2955 33.644C76.5595 33.644 76.8035 33.598 77.0275 33.506C77.2555 33.414 77.4535 33.284 77.6215 33.116C77.7895 32.948 77.9195 32.748 78.0115 32.516C78.1075 32.284 78.1555 32.028 78.1555 31.748V26.36H79.8115V31.76C79.8115 32.452 79.6635 33.054 79.3675 33.566C79.0715 34.078 78.6595 34.476 78.1315 34.76C77.6035 35.04 76.9915 35.18 76.2955 35.18ZM82.9266 35V26.36H84.5586V35H82.9266ZM91.3997 35V26.36H97.0397V27.884H93.0317V29.732H96.3197V31.256H93.0317V33.476H97.0397V35H91.3997ZM99.9178 35V26.36H101.55V33.476H105.27V35H99.9178ZM107.61 35V26.36H113.25V27.884H109.242V29.732H112.53V31.256H109.242V33.476H113.25V35H107.61ZM116.008 35V26.36H117.472L120.328 32.096L123.184 26.36H124.648V35H123.124V29.84L120.616 35H120.04L117.532 29.84V35H116.008ZM127.652 35V26.36H133.292V27.884H129.284V29.732H132.572V31.256H129.284V33.476H133.292V35H127.652ZM136.05 35V26.36H137.706L141.462 32.12V26.36H143.118V35H141.462L137.706 29.24V35H136.05ZM148.117 35V27.884H145.393V26.36H152.473V27.884H149.749V35H148.117ZM158.236 35V26.36H159.868V35H158.236ZM162.987 35V26.36H165.783C165.851 26.36 165.991 26.362 166.203 26.366C166.415 26.37 166.619 26.384 166.815 26.408C167.511 26.492 168.101 26.734 168.585 27.134C169.069 27.534 169.437 28.042 169.689 28.658C169.941 29.274 170.067 29.948 170.067 30.68C170.067 31.412 169.941 32.086 169.689 32.702C169.437 33.318 169.069 33.826 168.585 34.226C168.101 34.626 167.511 34.868 166.815 34.952C166.619 34.976 166.415 34.99 166.203 34.994C165.991 34.998 165.851 35 165.783 35H162.987ZM164.643 33.464H165.783C165.891 33.464 166.037 33.462 166.221 33.458C166.405 33.45 166.571 33.432 166.719 33.404C167.095 33.328 167.401 33.152 167.637 32.876C167.877 32.6 168.053 32.268 168.165 31.88C168.281 31.492 168.339 31.092 168.339 30.68C168.339 30.248 168.279 29.838 168.159 29.45C168.043 29.062 167.865 28.734 167.625 28.466C167.385 28.198 167.083 28.028 166.719 27.956C166.571 27.924 166.405 27.906 166.221 27.902C166.037 27.898 165.891 27.896 165.783 27.896H164.643V33.464Z" fill="#FF7F33"/>
          <rect x="24" y="78" width="399" height="44" rx="2" fill="white" stroke="#CCD4DA"/>
          <path d="M305.98 106V95.92H310.054C310.152 95.92 310.273 95.9247 310.418 95.934C310.563 95.9387 310.7 95.9527 310.831 95.976C311.391 96.0647 311.858 96.256 312.231 96.55C312.609 96.844 312.891 97.215 313.078 97.663C313.265 98.111 313.358 98.6057 313.358 99.147C313.358 99.693 313.265 100.19 313.078 100.638C312.891 101.086 312.609 101.457 312.231 101.751C311.858 102.045 311.391 102.236 310.831 102.325C310.7 102.344 310.56 102.358 310.411 102.367C310.266 102.376 310.147 102.381 310.054 102.381H307.443V106H305.98ZM307.443 100.995H309.998C310.091 100.995 310.194 100.99 310.306 100.981C310.423 100.972 310.532 100.955 310.635 100.932C310.934 100.862 311.174 100.734 311.356 100.547C311.538 100.356 311.669 100.136 311.748 99.889C311.827 99.6417 311.867 99.3943 311.867 99.147C311.867 98.8997 311.827 98.6547 311.748 98.412C311.669 98.1647 311.538 97.9477 311.356 97.761C311.174 97.5697 310.934 97.439 310.635 97.369C310.532 97.341 310.423 97.3223 310.306 97.313C310.194 97.3037 310.091 97.299 309.998 97.299H307.443V100.995ZM316.66 106.21C316.1 106.21 315.631 106.107 315.253 105.902C314.875 105.692 314.588 105.417 314.392 105.076C314.201 104.731 314.105 104.353 314.105 103.942C314.105 103.559 314.173 103.223 314.308 102.934C314.443 102.645 314.644 102.4 314.91 102.199C315.176 101.994 315.503 101.828 315.89 101.702C316.226 101.604 316.606 101.518 317.031 101.443C317.456 101.368 317.901 101.298 318.368 101.233C318.839 101.168 319.306 101.102 319.768 101.037L319.236 101.331C319.245 100.738 319.119 100.3 318.858 100.015C318.601 99.7257 318.158 99.581 317.528 99.581C317.131 99.581 316.767 99.6743 316.436 99.861C316.105 100.043 315.874 100.346 315.743 100.771L314.378 100.351C314.565 99.7023 314.919 99.1867 315.442 98.804C315.969 98.4213 316.669 98.23 317.542 98.23C318.219 98.23 318.807 98.3467 319.306 98.58C319.81 98.8087 320.179 99.1727 320.412 99.672C320.533 99.9193 320.608 100.181 320.636 100.456C320.664 100.731 320.678 101.028 320.678 101.345V106H319.383V104.271L319.635 104.495C319.322 105.074 318.923 105.505 318.438 105.79C317.957 106.07 317.365 106.21 316.66 106.21ZM316.919 105.013C317.334 105.013 317.691 104.941 317.99 104.796C318.289 104.647 318.529 104.458 318.711 104.229C318.893 104 319.012 103.762 319.068 103.515C319.147 103.291 319.192 103.039 319.201 102.759C319.215 102.479 319.222 102.255 319.222 102.087L319.698 102.262C319.236 102.332 318.816 102.395 318.438 102.451C318.06 102.507 317.717 102.563 317.409 102.619C317.106 102.67 316.835 102.733 316.597 102.808C316.396 102.878 316.217 102.962 316.058 103.06C315.904 103.158 315.78 103.277 315.687 103.417C315.598 103.557 315.554 103.727 315.554 103.928C315.554 104.124 315.603 104.306 315.701 104.474C315.799 104.637 315.948 104.768 316.149 104.866C316.35 104.964 316.606 105.013 316.919 105.013ZM325.387 106.203C324.467 106.203 323.718 106 323.14 105.594C322.561 105.188 322.206 104.616 322.076 103.879L323.574 103.648C323.667 104.04 323.882 104.35 324.218 104.579C324.558 104.803 324.981 104.915 325.485 104.915C325.942 104.915 326.299 104.822 326.556 104.635C326.817 104.448 326.948 104.192 326.948 103.865C326.948 103.674 326.901 103.52 326.808 103.403C326.719 103.282 326.53 103.167 326.241 103.06C325.951 102.953 325.51 102.82 324.918 102.661C324.269 102.493 323.753 102.313 323.371 102.122C322.993 101.926 322.722 101.7 322.559 101.443C322.4 101.182 322.321 100.867 322.321 100.498C322.321 100.041 322.442 99.6417 322.685 99.301C322.927 98.9603 323.268 98.6967 323.707 98.51C324.15 98.3233 324.668 98.23 325.261 98.23C325.839 98.23 326.355 98.321 326.808 98.503C327.26 98.685 327.627 98.944 327.907 99.28C328.187 99.6113 328.355 100.001 328.411 100.449L326.913 100.722C326.861 100.358 326.691 100.071 326.402 99.861C326.112 99.651 325.737 99.5367 325.275 99.518C324.831 99.4993 324.472 99.574 324.197 99.742C323.921 99.9053 323.784 100.132 323.784 100.421C323.784 100.589 323.835 100.731 323.938 100.848C324.045 100.965 324.25 101.077 324.554 101.184C324.857 101.291 325.305 101.42 325.898 101.569C326.532 101.732 327.036 101.914 327.41 102.115C327.783 102.311 328.049 102.547 328.208 102.822C328.371 103.093 328.453 103.422 328.453 103.809C328.453 104.556 328.18 105.141 327.634 105.566C327.092 105.991 326.343 106.203 325.387 106.203ZM334.327 106C333.851 106.093 333.385 106.133 332.927 106.119C332.47 106.105 332.062 106.016 331.702 105.853C331.343 105.69 331.072 105.433 330.89 105.083C330.727 104.77 330.638 104.453 330.624 104.131C330.615 103.804 330.61 103.436 330.61 103.025V96.34H332.08V102.955C332.08 103.258 332.083 103.522 332.087 103.746C332.097 103.97 332.146 104.159 332.234 104.313C332.402 104.602 332.668 104.768 333.032 104.81C333.401 104.847 333.833 104.831 334.327 104.761V106ZM329.161 99.616V98.44H334.327V99.616H329.161ZM338.933 106.21C338.181 106.21 337.521 106.047 336.952 105.72C336.387 105.389 335.946 104.929 335.629 104.341C335.316 103.748 335.16 103.062 335.16 102.283C335.16 101.457 335.314 100.741 335.622 100.134C335.934 99.5273 336.368 99.0583 336.924 98.727C337.479 98.3957 338.125 98.23 338.863 98.23C339.633 98.23 340.288 98.4097 340.83 98.769C341.371 99.1237 341.775 99.63 342.041 100.288C342.311 100.946 342.419 101.728 342.363 102.633H340.9V102.101C340.89 101.224 340.722 100.575 340.396 100.155C340.074 99.735 339.581 99.525 338.919 99.525C338.186 99.525 337.635 99.756 337.267 100.218C336.898 100.68 336.714 101.347 336.714 102.22C336.714 103.051 336.898 103.695 337.267 104.152C337.635 104.605 338.167 104.831 338.863 104.831C339.32 104.831 339.714 104.728 340.046 104.523C340.382 104.313 340.643 104.014 340.83 103.627L342.265 104.082C341.971 104.759 341.525 105.284 340.928 105.657C340.33 106.026 339.665 106.21 338.933 106.21ZM336.238 102.633V101.492H341.635V102.633H336.238ZM350.943 106.21C349.935 106.21 349.076 105.991 348.367 105.552C347.658 105.109 347.114 104.493 346.736 103.704C346.363 102.915 346.176 102.001 346.176 100.96C346.176 99.9193 346.363 99.0047 346.736 98.216C347.114 97.4273 347.658 96.8137 348.367 96.375C349.076 95.9317 349.935 95.71 350.943 95.71C352.105 95.71 353.066 96.004 353.827 96.592C354.592 97.18 355.124 97.971 355.423 98.965L353.939 99.364C353.743 98.6593 353.393 98.1063 352.889 97.705C352.39 97.3037 351.741 97.103 350.943 97.103C350.229 97.103 349.634 97.264 349.158 97.586C348.682 97.908 348.323 98.3583 348.08 98.937C347.842 99.5157 347.723 100.19 347.723 100.96C347.718 101.73 347.835 102.404 348.073 102.983C348.316 103.562 348.675 104.012 349.151 104.334C349.632 104.656 350.229 104.817 350.943 104.817C351.741 104.817 352.39 104.616 352.889 104.215C353.393 103.809 353.743 103.256 353.939 102.556L355.423 102.955C355.124 103.949 354.592 104.74 353.827 105.328C353.066 105.916 352.105 106.21 350.943 106.21ZM357.102 106V95.71H358.565V106H357.102ZM360.808 97.201V95.78H362.271V97.201H360.808ZM360.808 106V98.44H362.271V106H360.808ZM367.922 106.21C367.198 106.21 366.592 106.035 366.102 105.685C365.612 105.33 365.241 104.852 364.989 104.25C364.737 103.648 364.611 102.969 364.611 102.213C364.611 101.457 364.734 100.778 364.982 100.176C365.234 99.574 365.602 99.1003 366.088 98.755C366.578 98.405 367.18 98.23 367.894 98.23C368.603 98.23 369.214 98.405 369.728 98.755C370.246 99.1003 370.645 99.574 370.925 100.176C371.205 100.773 371.345 101.452 371.345 102.213C371.345 102.969 371.205 103.65 370.925 104.257C370.649 104.859 370.255 105.335 369.742 105.685C369.233 106.035 368.626 106.21 367.922 106.21ZM364.366 109.36V98.44H365.668V103.879H365.836V109.36H364.366ZM367.719 104.887C368.185 104.887 368.57 104.768 368.874 104.53C369.182 104.292 369.41 103.972 369.56 103.571C369.714 103.165 369.791 102.712 369.791 102.213C369.791 101.718 369.714 101.27 369.56 100.869C369.41 100.468 369.179 100.148 368.867 99.91C368.554 99.672 368.155 99.553 367.67 99.553C367.212 99.553 366.834 99.665 366.536 99.889C366.242 100.113 366.022 100.426 365.878 100.827C365.738 101.228 365.668 101.69 365.668 102.213C365.668 102.736 365.738 103.198 365.878 103.599C366.018 104 366.239 104.315 366.543 104.544C366.846 104.773 367.238 104.887 367.719 104.887ZM376.439 106.21C375.716 106.21 375.109 106.035 374.619 105.685C374.129 105.33 373.758 104.852 373.506 104.25C373.254 103.648 373.128 102.969 373.128 102.213C373.128 101.457 373.252 100.778 373.499 100.176C373.751 99.574 374.12 99.1003 374.605 98.755C375.095 98.405 375.697 98.23 376.411 98.23C377.12 98.23 377.732 98.405 378.245 98.755C378.763 99.1003 379.162 99.574 379.442 100.176C379.722 100.773 379.862 101.452 379.862 102.213C379.862 102.969 379.722 103.65 379.442 104.257C379.167 104.859 378.772 105.335 378.259 105.685C377.75 106.035 377.144 106.21 376.439 106.21ZM372.883 106V95.92H374.353V100.561H374.185V106H372.883ZM376.236 104.887C376.703 104.887 377.088 104.768 377.391 104.53C377.699 104.292 377.928 103.972 378.077 103.571C378.231 103.165 378.308 102.712 378.308 102.213C378.308 101.718 378.231 101.27 378.077 100.869C377.928 100.468 377.697 100.148 377.384 99.91C377.071 99.672 376.672 99.553 376.187 99.553C375.73 99.553 375.352 99.665 375.053 99.889C374.759 100.113 374.54 100.426 374.395 100.827C374.255 101.228 374.185 101.69 374.185 102.213C374.185 102.736 374.255 103.198 374.395 103.599C374.535 104 374.757 104.315 375.06 104.544C375.363 104.773 375.755 104.887 376.236 104.887ZM384.691 106.21C383.935 106.21 383.279 106.04 382.724 105.699C382.168 105.358 381.739 104.889 381.436 104.292C381.137 103.69 380.988 102.997 380.988 102.213C380.988 101.424 381.142 100.731 381.45 100.134C381.758 99.532 382.189 99.0653 382.745 98.734C383.3 98.398 383.949 98.23 384.691 98.23C385.447 98.23 386.102 98.4003 386.658 98.741C387.213 99.0817 387.642 99.5507 387.946 100.148C388.249 100.745 388.401 101.434 388.401 102.213C388.401 103.002 388.247 103.697 387.939 104.299C387.635 104.896 387.206 105.365 386.651 105.706C386.095 106.042 385.442 106.21 384.691 106.21ZM384.691 104.831C385.414 104.831 385.953 104.588 386.308 104.103C386.667 103.613 386.847 102.983 386.847 102.213C386.847 101.424 386.665 100.794 386.301 100.323C385.941 99.847 385.405 99.609 384.691 99.609C384.201 99.609 383.797 99.721 383.48 99.945C383.162 100.164 382.927 100.47 382.773 100.862C382.619 101.249 382.542 101.7 382.542 102.213C382.542 103.006 382.724 103.641 383.088 104.117C383.452 104.593 383.986 104.831 384.691 104.831ZM392.074 106.21C391.514 106.21 391.045 106.107 390.667 105.902C390.289 105.692 390.002 105.417 389.806 105.076C389.615 104.731 389.519 104.353 389.519 103.942C389.519 103.559 389.587 103.223 389.722 102.934C389.857 102.645 390.058 102.4 390.324 102.199C390.59 101.994 390.917 101.828 391.304 101.702C391.64 101.604 392.02 101.518 392.445 101.443C392.87 101.368 393.315 101.298 393.782 101.233C394.253 101.168 394.72 101.102 395.182 101.037L394.65 101.331C394.659 100.738 394.533 100.3 394.272 100.015C394.015 99.7257 393.572 99.581 392.942 99.581C392.545 99.581 392.181 99.6743 391.85 99.861C391.519 100.043 391.288 100.346 391.157 100.771L389.792 100.351C389.979 99.7023 390.333 99.1867 390.856 98.804C391.383 98.4213 392.083 98.23 392.956 98.23C393.633 98.23 394.221 98.3467 394.72 98.58C395.224 98.8087 395.593 99.1727 395.826 99.672C395.947 99.9193 396.022 100.181 396.05 100.456C396.078 100.731 396.092 101.028 396.092 101.345V106H394.797V104.271L395.049 104.495C394.736 105.074 394.337 105.505 393.852 105.79C393.371 106.07 392.779 106.21 392.074 106.21ZM392.333 105.013C392.748 105.013 393.105 104.941 393.404 104.796C393.703 104.647 393.943 104.458 394.125 104.229C394.307 104 394.426 103.762 394.482 103.515C394.561 103.291 394.606 103.039 394.615 102.759C394.629 102.479 394.636 102.255 394.636 102.087L395.112 102.262C394.65 102.332 394.23 102.395 393.852 102.451C393.474 102.507 393.131 102.563 392.823 102.619C392.52 102.67 392.249 102.733 392.011 102.808C391.81 102.878 391.631 102.962 391.472 103.06C391.318 103.158 391.194 103.277 391.101 103.417C391.012 103.557 390.968 103.727 390.968 103.928C390.968 104.124 391.017 104.306 391.115 104.474C391.213 104.637 391.362 104.768 391.563 104.866C391.764 104.964 392.02 105.013 392.333 105.013ZM397.91 106V98.44H399.212V100.274L399.03 100.036C399.123 99.7933 399.244 99.5717 399.394 99.371C399.543 99.1657 399.716 98.9977 399.912 98.867C400.103 98.727 400.315 98.6197 400.549 98.545C400.787 98.4657 401.029 98.419 401.277 98.405C401.524 98.3863 401.762 98.398 401.991 98.44V99.812C401.743 99.7467 401.468 99.728 401.165 99.756C400.866 99.784 400.591 99.8797 400.339 100.043C400.101 100.197 399.912 100.384 399.772 100.603C399.636 100.822 399.538 101.067 399.478 101.338C399.417 101.604 399.387 101.886 399.387 102.185V106H397.91ZM406.19 106.21C405.485 106.21 404.876 106.035 404.363 105.685C403.854 105.335 403.46 104.859 403.18 104.257C402.905 103.65 402.767 102.969 402.767 102.213C402.767 101.452 402.907 100.773 403.187 100.176C403.467 99.574 403.864 99.1003 404.377 98.755C404.895 98.405 405.509 98.23 406.218 98.23C406.932 98.23 407.532 98.405 408.017 98.755C408.507 99.1003 408.876 99.574 409.123 100.176C409.375 100.778 409.501 101.457 409.501 102.213C409.501 102.969 409.375 103.648 409.123 104.25C408.871 104.852 408.5 105.33 408.01 105.685C407.52 106.035 406.913 106.21 406.19 106.21ZM406.393 104.887C406.874 104.887 407.266 104.773 407.569 104.544C407.872 104.315 408.094 104 408.234 103.599C408.374 103.198 408.444 102.736 408.444 102.213C408.444 101.69 408.372 101.228 408.227 100.827C408.087 100.426 407.868 100.113 407.569 99.889C407.275 99.665 406.899 99.553 406.442 99.553C405.957 99.553 405.558 99.672 405.245 99.91C404.932 100.148 404.699 100.468 404.545 100.869C404.396 101.27 404.321 101.718 404.321 102.213C404.321 102.712 404.396 103.165 404.545 103.571C404.699 103.972 404.928 104.292 405.231 104.53C405.539 104.768 405.926 104.887 406.393 104.887ZM408.444 106V100.561H408.276V95.92H409.746V106H408.444Z" fill="#FF7F33"/>
          <path d="M40.98 105V94.92H45.054C45.152 94.92 45.2733 94.9247 45.418 94.934C45.5627 94.9387 45.7003 94.9527 45.831 94.976C46.391 95.0647 46.8577 95.256 47.231 95.55C47.609 95.844 47.8913 96.215 48.078 96.663C48.2647 97.111 48.358 97.6057 48.358 98.147C48.358 98.693 48.2647 99.19 48.078 99.638C47.8913 100.086 47.609 100.457 47.231 100.751C46.8577 101.045 46.391 101.236 45.831 101.325C45.7003 101.344 45.5603 101.358 45.411 101.367C45.2663 101.376 45.1473 101.381 45.054 101.381H42.443V105H40.98ZM42.443 99.995H44.998C45.0913 99.995 45.194 99.9903 45.306 99.981C45.4227 99.9717 45.5323 99.9553 45.635 99.932C45.9337 99.862 46.174 99.7337 46.356 99.547C46.538 99.3557 46.6687 99.1363 46.748 98.889C46.8273 98.6417 46.867 98.3943 46.867 98.147C46.867 97.8997 46.8273 97.6547 46.748 97.412C46.6687 97.1647 46.538 96.9477 46.356 96.761C46.174 96.5697 45.9337 96.439 45.635 96.369C45.5323 96.341 45.4227 96.3223 45.306 96.313C45.194 96.3037 45.0913 96.299 44.998 96.299H42.443V99.995ZM51.7999 105.21C51.2399 105.21 50.7709 105.107 50.3929 104.902C50.0149 104.692 49.7279 104.417 49.5319 104.076C49.3406 103.731 49.2449 103.353 49.2449 102.942C49.2449 102.559 49.3126 102.223 49.4479 101.934C49.5833 101.645 49.7839 101.4 50.0499 101.199C50.3159 100.994 50.6426 100.828 51.0299 100.702C51.3659 100.604 51.7463 100.518 52.1709 100.443C52.5956 100.368 53.0413 100.298 53.5079 100.233C53.9793 100.168 54.4459 100.102 54.9079 100.037L54.3759 100.331C54.3853 99.7383 54.2593 99.2997 53.9979 99.015C53.7413 98.7257 53.2979 98.581 52.6679 98.581C52.2713 98.581 51.9073 98.6743 51.5759 98.861C51.2446 99.043 51.0136 99.3463 50.8829 99.771L49.5179 99.351C49.7046 98.7023 50.0593 98.1867 50.5819 97.804C51.1093 97.4213 51.8093 97.23 52.6819 97.23C53.3586 97.23 53.9466 97.3467 54.4459 97.58C54.9499 97.8087 55.3186 98.1727 55.5519 98.672C55.6733 98.9193 55.7479 99.1807 55.7759 99.456C55.8039 99.7313 55.8179 100.028 55.8179 100.345V105H54.5229V103.271L54.7749 103.495C54.4623 104.074 54.0633 104.505 53.5779 104.79C53.0973 105.07 52.5046 105.21 51.7999 105.21ZM52.0589 104.013C52.4743 104.013 52.8313 103.941 53.1299 103.796C53.4286 103.647 53.6689 103.458 53.8509 103.229C54.0329 103 54.1519 102.762 54.2079 102.515C54.2873 102.291 54.3316 102.039 54.3409 101.759C54.3549 101.479 54.3619 101.255 54.3619 101.087L54.8379 101.262C54.3759 101.332 53.9559 101.395 53.5779 101.451C53.1999 101.507 52.8569 101.563 52.5489 101.619C52.2456 101.67 51.9749 101.733 51.7369 101.808C51.5363 101.878 51.3566 101.962 51.1979 102.06C51.0439 102.158 50.9203 102.277 50.8269 102.417C50.7383 102.557 50.6939 102.727 50.6939 102.928C50.6939 103.124 50.7429 103.306 50.8409 103.474C50.9389 103.637 51.0883 103.768 51.2889 103.866C51.4896 103.964 51.7463 104.013 52.0589 104.013ZM60.6666 105.203C59.7473 105.203 58.9983 105 58.4196 104.594C57.841 104.188 57.4863 103.616 57.3556 102.879L58.8536 102.648C58.947 103.04 59.1616 103.35 59.4976 103.579C59.8383 103.803 60.2606 103.915 60.7646 103.915C61.222 103.915 61.579 103.822 61.8356 103.635C62.097 103.448 62.2276 103.192 62.2276 102.865C62.2276 102.674 62.181 102.52 62.0876 102.403C61.999 102.282 61.81 102.167 61.5206 102.06C61.2313 101.953 60.7903 101.82 60.1976 101.661C59.549 101.493 59.0333 101.313 58.6506 101.122C58.2726 100.926 58.002 100.7 57.8386 100.443C57.68 100.182 57.6006 99.8667 57.6006 99.498C57.6006 99.0407 57.722 98.6417 57.9646 98.301C58.2073 97.9603 58.548 97.6967 58.9866 97.51C59.43 97.3233 59.948 97.23 60.5406 97.23C61.1193 97.23 61.635 97.321 62.0876 97.503C62.5403 97.685 62.9066 97.944 63.1866 98.28C63.4666 98.6113 63.6346 99.001 63.6906 99.449L62.1926 99.722C62.1413 99.358 61.971 99.071 61.6816 98.861C61.3923 98.651 61.0166 98.5367 60.5546 98.518C60.1113 98.4993 59.752 98.574 59.4766 98.742C59.2013 98.9053 59.0636 99.1317 59.0636 99.421C59.0636 99.589 59.115 99.7313 59.2176 99.848C59.325 99.9647 59.5303 100.077 59.8336 100.184C60.137 100.291 60.585 100.42 61.1776 100.569C61.8123 100.732 62.3163 100.914 62.6896 101.115C63.063 101.311 63.329 101.547 63.4876 101.822C63.651 102.093 63.7326 102.422 63.7326 102.809C63.7326 103.556 63.4596 104.141 62.9136 104.566C62.3723 104.991 61.6233 105.203 60.6666 105.203ZM69.7475 105C69.2715 105.093 68.8048 105.133 68.3475 105.119C67.8902 105.105 67.4818 105.016 67.1225 104.853C66.7632 104.69 66.4925 104.433 66.3105 104.083C66.1472 103.77 66.0585 103.453 66.0445 103.131C66.0352 102.804 66.0305 102.436 66.0305 102.025V95.34H67.5005V101.955C67.5005 102.258 67.5028 102.522 67.5075 102.746C67.5168 102.97 67.5658 103.159 67.6545 103.313C67.8225 103.602 68.0885 103.768 68.4525 103.81C68.8212 103.847 69.2528 103.831 69.7475 103.761V105ZM64.5815 98.616V97.44H69.7475V98.616H64.5815ZM74.4926 105.21C73.7413 105.21 73.0809 105.047 72.5116 104.72C71.9469 104.389 71.5059 103.929 71.1886 103.341C70.8759 102.748 70.7196 102.062 70.7196 101.283C70.7196 100.457 70.8736 99.7407 71.1816 99.134C71.4943 98.5273 71.9283 98.0583 72.4836 97.727C73.0389 97.3957 73.6853 97.23 74.4226 97.23C75.1926 97.23 75.8483 97.4097 76.3896 97.769C76.9309 98.1237 77.3346 98.63 77.6006 99.288C77.8713 99.946 77.9786 100.728 77.9226 101.633H76.4596V101.101C76.4503 100.224 76.2823 99.575 75.9556 99.155C75.6336 98.735 75.1413 98.525 74.4786 98.525C73.7459 98.525 73.1953 98.756 72.8266 99.218C72.4579 99.68 72.2736 100.347 72.2736 101.22C72.2736 102.051 72.4579 102.695 72.8266 103.152C73.1953 103.605 73.7273 103.831 74.4226 103.831C74.8799 103.831 75.2743 103.728 75.6056 103.523C75.9416 103.313 76.2029 103.014 76.3896 102.627L77.8246 103.082C77.5306 103.759 77.0849 104.284 76.4876 104.657C75.8903 105.026 75.2253 105.21 74.4926 105.21ZM71.7976 101.633V100.492H77.1946V101.633H71.7976ZM86.7829 105.21C85.7749 105.21 84.9162 104.991 84.2069 104.552C83.4975 104.109 82.9539 103.493 82.5759 102.704C82.2025 101.915 82.0159 101.001 82.0159 99.96C82.0159 98.9193 82.2025 98.0047 82.5759 97.216C82.9539 96.4273 83.4975 95.8137 84.2069 95.375C84.9162 94.9317 85.7749 94.71 86.7829 94.71C87.9449 94.71 88.9062 95.004 89.6669 95.592C90.4322 96.18 90.9642 96.971 91.2629 97.965L89.7789 98.364C89.5829 97.6593 89.2329 97.1063 88.7289 96.705C88.2295 96.3037 87.5809 96.103 86.7829 96.103C86.0689 96.103 85.4739 96.264 84.9979 96.586C84.5219 96.908 84.1625 97.3583 83.9199 97.937C83.6819 98.5157 83.5629 99.19 83.5629 99.96C83.5582 100.73 83.6749 101.404 83.9129 101.983C84.1555 102.562 84.5149 103.012 84.9909 103.334C85.4715 103.656 86.0689 103.817 86.7829 103.817C87.5809 103.817 88.2295 103.616 88.7289 103.215C89.2329 102.809 89.5829 102.256 89.7789 101.556L91.2629 101.955C90.9642 102.949 90.4322 103.74 89.6669 104.328C88.9062 104.916 87.9449 105.21 86.7829 105.21ZM97.0202 105.21C96.2969 105.21 95.6436 105.086 95.0602 104.839C94.4816 104.587 94.0032 104.23 93.6252 103.768C93.2519 103.301 93.0092 102.748 92.8972 102.109L94.4232 101.878C94.5772 102.494 94.8992 102.975 95.3892 103.32C95.8792 103.661 96.4509 103.831 97.1042 103.831C97.5102 103.831 97.8836 103.768 98.2242 103.642C98.5649 103.511 98.8379 103.327 99.0432 103.089C99.2532 102.846 99.3582 102.557 99.3582 102.221C99.3582 102.039 99.3256 101.878 99.2602 101.738C99.1996 101.598 99.1132 101.477 99.0012 101.374C98.8939 101.267 98.7609 101.176 98.6023 101.101C98.4482 101.022 98.2779 100.954 98.0912 100.898L95.5082 100.135C95.2562 100.06 94.9996 99.9647 94.7382 99.848C94.4769 99.7267 94.2366 99.5703 94.0172 99.379C93.8026 99.183 93.6276 98.9427 93.4922 98.658C93.3569 98.3687 93.2892 98.0187 93.2892 97.608C93.2892 96.9873 93.4479 96.4623 93.7652 96.033C94.0872 95.599 94.5212 95.2723 95.0672 95.053C95.6132 94.829 96.2246 94.717 96.9012 94.717C97.5826 94.7263 98.1916 94.8477 98.7282 95.081C99.2696 95.3143 99.7176 95.6503 100.072 96.089C100.432 96.523 100.679 97.0503 100.814 97.671L99.2462 97.937C99.1762 97.559 99.0269 97.2347 98.7983 96.964C98.5696 96.6887 98.2896 96.4787 97.9582 96.334C97.6269 96.1847 97.2676 96.1077 96.8802 96.103C96.5069 96.0937 96.1639 96.1497 95.8512 96.271C95.5432 96.3923 95.2959 96.5627 95.1092 96.782C94.9272 97.0013 94.8362 97.2533 94.8362 97.538C94.8362 97.818 94.9179 98.0443 95.0812 98.217C95.2446 98.3897 95.4452 98.5273 95.6832 98.63C95.9259 98.728 96.1662 98.8097 96.4042 98.875L98.2662 99.4C98.4996 99.4653 98.7632 99.554 99.0573 99.666C99.3559 99.7733 99.6429 99.925 99.9183 100.121C100.198 100.317 100.429 100.578 100.611 100.905C100.793 101.227 100.884 101.633 100.884 102.123C100.884 102.632 100.782 103.08 100.576 103.467C100.371 103.85 100.089 104.172 99.7292 104.433C99.3746 104.69 98.9639 104.883 98.4972 105.014C98.0306 105.145 97.5382 105.21 97.0202 105.21ZM106.375 105.21C105.652 105.21 104.998 105.086 104.415 104.839C103.836 104.587 103.358 104.23 102.98 103.768C102.607 103.301 102.364 102.748 102.252 102.109L103.778 101.878C103.932 102.494 104.254 102.975 104.744 103.32C105.234 103.661 105.806 103.831 106.459 103.831C106.865 103.831 107.238 103.768 107.579 103.642C107.92 103.511 108.193 103.327 108.398 103.089C108.608 102.846 108.713 102.557 108.713 102.221C108.713 102.039 108.68 101.878 108.615 101.738C108.554 101.598 108.468 101.477 108.356 101.374C108.249 101.267 108.116 101.176 107.957 101.101C107.803 101.022 107.633 100.954 107.446 100.898L104.863 100.135C104.611 100.06 104.354 99.9647 104.093 99.848C103.832 99.7267 103.591 99.5703 103.372 99.379C103.157 99.183 102.982 98.9427 102.847 98.658C102.712 98.3687 102.644 98.0187 102.644 97.608C102.644 96.9873 102.803 96.4623 103.12 96.033C103.442 95.599 103.876 95.2723 104.422 95.053C104.968 94.829 105.579 94.717 106.256 94.717C106.937 94.7263 107.546 94.8477 108.083 95.081C108.624 95.3143 109.072 95.6503 109.427 96.089C109.786 96.523 110.034 97.0503 110.169 97.671L108.601 97.937C108.531 97.559 108.382 97.2347 108.153 96.964C107.924 96.6887 107.644 96.4787 107.313 96.334C106.982 96.1847 106.622 96.1077 106.235 96.103C105.862 96.0937 105.519 96.1497 105.206 96.271C104.898 96.3923 104.651 96.5627 104.464 96.782C104.282 97.0013 104.191 97.2533 104.191 97.538C104.191 97.818 104.273 98.0443 104.436 98.217C104.599 98.3897 104.8 98.5273 105.038 98.63C105.281 98.728 105.521 98.8097 105.759 98.875L107.621 99.4C107.854 99.4653 108.118 99.554 108.412 99.666C108.711 99.7733 108.998 99.925 109.273 100.121C109.553 100.317 109.784 100.578 109.966 100.905C110.148 101.227 110.239 101.633 110.239 102.123C110.239 102.632 110.136 103.08 109.931 103.467C109.726 103.85 109.443 104.172 109.084 104.433C108.729 104.69 108.319 104.883 107.852 105.014C107.385 105.145 106.893 105.21 106.375 105.21ZM114.954 105V94.92H116.417V105H114.954ZM118.659 105V94.92H121.816C121.909 94.92 122.082 94.9223 122.334 94.927C122.59 94.9317 122.835 94.9503 123.069 94.983C123.857 95.081 124.52 95.3633 125.057 95.83C125.598 96.2967 126.006 96.8893 126.282 97.608C126.557 98.322 126.695 99.106 126.695 99.96C126.695 100.819 126.557 101.607 126.282 102.326C126.006 103.04 125.598 103.63 125.057 104.097C124.52 104.559 123.857 104.839 123.069 104.937C122.835 104.97 122.59 104.988 122.334 104.993C122.082 104.998 121.909 105 121.816 105H118.659ZM120.157 103.607H121.816C121.974 103.607 122.163 103.602 122.383 103.593C122.602 103.584 122.796 103.565 122.964 103.537C123.477 103.439 123.892 103.217 124.21 102.872C124.532 102.522 124.767 102.093 124.917 101.584C125.066 101.075 125.141 100.534 125.141 99.96C125.141 99.3673 125.064 98.819 124.91 98.315C124.756 97.8063 124.518 97.3817 124.196 97.041C123.878 96.6957 123.468 96.4763 122.964 96.383C122.796 96.3503 122.6 96.3317 122.376 96.327C122.156 96.3177 121.97 96.313 121.816 96.313H120.157V103.607Z" fill="#B3BEC6"/>
          <path d="M34 48C28.4903 48 24 52.4903 24 58C24 63.5097 28.4903 68 34 68C39.5097 68 44 63.5097 44 58C44 52.4903 39.5097 48 34 48ZM34 67.0291C29.0243 67.0291 24.9709 62.9757 24.9709 58C24.9709 53.0243 29.0243 48.9709 34 48.9709C38.9757 48.9709 43.0291 53.0243 43.0291 58C43.0291 62.9757 38.9757 67.0291 34 67.0291Z" fill="#FF7F33"/>
          <path d="M33.9985 64.0907C37.3631 64.0907 40.0907 61.3631 40.0907 57.9985C40.0907 54.6338 37.3631 51.9062 33.9985 51.9062C30.6338 51.9062 27.9062 54.6338 27.9062 57.9985C27.9062 61.3631 30.6338 64.0907 33.9985 64.0907Z" fill="#FF7F33"/>
          <path d="M59.5575 64.225C58.4775 64.225 57.5575 63.99 56.7975 63.52C56.0375 63.045 55.455 62.385 55.05 61.54C54.65 60.695 54.45 59.715 54.45 58.6C54.45 57.485 54.65 56.505 55.05 55.66C55.455 54.815 56.0375 54.1575 56.7975 53.6875C57.5575 53.2125 58.4775 52.975 59.5575 52.975C60.8025 52.975 61.8325 53.29 62.6475 53.92C63.4675 54.55 64.0375 55.3975 64.3575 56.4625L62.7675 56.89C62.5575 56.135 62.1825 55.5425 61.6425 55.1125C61.1075 54.6825 60.4125 54.4675 59.5575 54.4675C58.7925 54.4675 58.155 54.64 57.645 54.985C57.135 55.33 56.75 55.8125 56.49 56.4325C56.235 57.0525 56.1075 57.775 56.1075 58.6C56.1025 59.425 56.2275 60.1475 56.4825 60.7675C56.7425 61.3875 57.1275 61.87 57.6375 62.215C58.1525 62.56 58.7925 62.7325 59.5575 62.7325C60.4125 62.7325 61.1075 62.5175 61.6425 62.0875C62.1825 61.6525 62.5575 61.06 62.7675 60.31L64.3575 60.7375C64.0375 61.8025 63.4675 62.65 62.6475 63.28C61.8325 63.91 60.8025 64.225 59.5575 64.225ZM70.3761 64.225C69.6011 64.225 68.9011 64.0925 68.2761 63.8275C67.6561 63.5575 67.1436 63.175 66.7386 62.68C66.3386 62.18 66.0786 61.5875 65.9586 60.9025L67.5936 60.655C67.7586 61.315 68.1036 61.83 68.6286 62.2C69.1536 62.565 69.7661 62.7475 70.4661 62.7475C70.9011 62.7475 71.3011 62.68 71.6661 62.545C72.0311 62.405 72.3236 62.2075 72.5436 61.9525C72.7686 61.6925 72.8811 61.3825 72.8811 61.0225C72.8811 60.8275 72.8461 60.655 72.7761 60.505C72.7111 60.355 72.6186 60.225 72.4986 60.115C72.3836 60 72.2411 59.9025 72.0711 59.8225C71.9061 59.7375 71.7236 59.665 71.5236 59.605L68.7561 58.7875C68.4861 58.7075 68.2111 58.605 67.9311 58.48C67.6511 58.35 67.3936 58.1825 67.1586 57.9775C66.9286 57.7675 66.7411 57.51 66.5961 57.205C66.4511 56.895 66.3786 56.52 66.3786 56.08C66.3786 55.415 66.5486 54.8525 66.8886 54.3925C67.2336 53.9275 67.6986 53.5775 68.2836 53.3425C68.8686 53.1025 69.5236 52.9825 70.2486 52.9825C70.9786 52.9925 71.6311 53.1225 72.2061 53.3725C72.7861 53.6225 73.2661 53.9825 73.6461 54.4525C74.0311 54.9175 74.2961 55.4825 74.4411 56.1475L72.7611 56.4325C72.6861 56.0275 72.5261 55.68 72.2811 55.39C72.0361 55.095 71.7361 54.87 71.3811 54.715C71.0261 54.555 70.6411 54.4725 70.2261 54.4675C69.8261 54.4575 69.4586 54.5175 69.1236 54.6475C68.7936 54.7775 68.5286 54.96 68.3286 55.195C68.1336 55.43 68.0361 55.7 68.0361 56.005C68.0361 56.305 68.1236 56.5475 68.2986 56.7325C68.4736 56.9175 68.6886 57.065 68.9436 57.175C69.2036 57.28 69.4611 57.3675 69.7161 57.4375L71.7111 58C71.9611 58.07 72.2436 58.165 72.5586 58.285C72.8786 58.4 73.1861 58.5625 73.4811 58.7725C73.7811 58.9825 74.0286 59.2625 74.2236 59.6125C74.4186 59.9575 74.5161 60.3925 74.5161 60.9175C74.5161 61.4625 74.4061 61.9425 74.1861 62.3575C73.9661 62.7675 73.6636 63.1125 73.2786 63.3925C72.8986 63.6675 72.4586 63.875 71.9586 64.015C71.4586 64.155 70.9311 64.225 70.3761 64.225ZM80.2492 64.225C79.4742 64.225 78.7742 64.0925 78.1492 63.8275C77.5292 63.5575 77.0167 63.175 76.6117 62.68C76.2117 62.18 75.9517 61.5875 75.8317 60.9025L77.4667 60.655C77.6317 61.315 77.9767 61.83 78.5017 62.2C79.0267 62.565 79.6392 62.7475 80.3392 62.7475C80.7742 62.7475 81.1742 62.68 81.5392 62.545C81.9042 62.405 82.1967 62.2075 82.4167 61.9525C82.6417 61.6925 82.7542 61.3825 82.7542 61.0225C82.7542 60.8275 82.7192 60.655 82.6492 60.505C82.5842 60.355 82.4917 60.225 82.3717 60.115C82.2567 60 82.1142 59.9025 81.9442 59.8225C81.7792 59.7375 81.5967 59.665 81.3967 59.605L78.6292 58.7875C78.3592 58.7075 78.0842 58.605 77.8042 58.48C77.5242 58.35 77.2667 58.1825 77.0317 57.9775C76.8017 57.7675 76.6142 57.51 76.4692 57.205C76.3242 56.895 76.2517 56.52 76.2517 56.08C76.2517 55.415 76.4217 54.8525 76.7617 54.3925C77.1067 53.9275 77.5717 53.5775 78.1567 53.3425C78.7417 53.1025 79.3967 52.9825 80.1217 52.9825C80.8517 52.9925 81.5042 53.1225 82.0792 53.3725C82.6592 53.6225 83.1392 53.9825 83.5192 54.4525C83.9042 54.9175 84.1692 55.4825 84.3142 56.1475L82.6342 56.4325C82.5592 56.0275 82.3992 55.68 82.1542 55.39C81.9092 55.095 81.6092 54.87 81.2542 54.715C80.8992 54.555 80.5142 54.4725 80.0992 54.4675C79.6992 54.4575 79.3317 54.5175 78.9967 54.6475C78.6667 54.7775 78.4017 54.96 78.2017 55.195C78.0067 55.43 77.9092 55.7 77.9092 56.005C77.9092 56.305 77.9967 56.5475 78.1717 56.7325C78.3467 56.9175 78.5617 57.065 78.8167 57.175C79.0767 57.28 79.3342 57.3675 79.5892 57.4375L81.5842 58C81.8342 58.07 82.1167 58.165 82.4317 58.285C82.7517 58.4 83.0592 58.5625 83.3542 58.7725C83.6542 58.9825 83.9017 59.2625 84.0967 59.6125C84.2917 59.9575 84.3892 60.3925 84.3892 60.9175C84.3892 61.4625 84.2792 61.9425 84.0592 62.3575C83.8392 62.7675 83.5367 63.1125 83.1517 63.3925C82.7717 63.6675 82.3317 63.875 81.8317 64.015C81.3317 64.155 80.8042 64.225 80.2492 64.225Z" fill="#002845"/>
          <path opacity="0.3" d="M125 48C119.49 48 115 52.4903 115 58C115 63.5097 119.49 68 125 68C130.51 68 135 63.5097 135 58C135 52.4903 130.51 48 125 48ZM125 67.0291C120.024 67.0291 115.971 62.9757 115.971 58C115.971 53.0243 120.024 48.9709 125 48.9709C129.976 48.9709 134.029 53.0243 134.029 58C134.029 62.9757 129.976 67.0291 125 67.0291Z" fill="#002845"/>
          <path d="M145.15 64L148.833 58.5325L145.247 53.2H147.168L149.8 57.205L152.418 53.2H154.345L150.76 58.5325L154.435 64H152.515L149.8 59.8675L147.078 64H145.15ZM155.63 64V53.2H159.995C160.1 53.2 160.23 53.205 160.385 53.215C160.54 53.22 160.688 53.235 160.828 53.26C161.428 53.355 161.928 53.56 162.328 53.875C162.733 54.19 163.035 54.5875 163.235 55.0675C163.435 55.5475 163.535 56.0775 163.535 56.6575C163.535 57.2425 163.435 57.775 163.235 58.255C163.035 58.735 162.733 59.1325 162.328 59.4475C161.928 59.7625 161.428 59.9675 160.828 60.0625C160.688 60.0825 160.538 60.0975 160.378 60.1075C160.223 60.1175 160.095 60.1225 159.995 60.1225H157.198V64H155.63ZM157.198 58.6375H159.935C160.035 58.6375 160.145 58.6325 160.265 58.6225C160.39 58.6125 160.508 58.595 160.618 58.57C160.938 58.495 161.195 58.3575 161.39 58.1575C161.585 57.9525 161.725 57.7175 161.81 57.4525C161.895 57.1875 161.938 56.9225 161.938 56.6575C161.938 56.3925 161.895 56.13 161.81 55.87C161.725 55.605 161.585 55.3725 161.39 55.1725C161.195 54.9675 160.938 54.8275 160.618 54.7525C160.508 54.7225 160.39 54.7025 160.265 54.6925C160.145 54.6825 160.035 54.6775 159.935 54.6775H157.198V58.6375ZM167.073 64.225C166.473 64.225 165.97 64.115 165.565 63.895C165.16 63.67 164.853 63.375 164.643 63.01C164.438 62.64 164.335 62.235 164.335 61.795C164.335 61.385 164.408 61.025 164.553 60.715C164.698 60.405 164.913 60.1425 165.198 59.9275C165.483 59.7075 165.833 59.53 166.248 59.395C166.608 59.29 167.015 59.1975 167.47 59.1175C167.925 59.0375 168.403 58.9625 168.903 58.8925C169.408 58.8225 169.908 58.7525 170.403 58.6825L169.833 58.9975C169.843 58.3625 169.708 57.8925 169.428 57.5875C169.153 57.2775 168.678 57.1225 168.003 57.1225C167.578 57.1225 167.188 57.2225 166.833 57.4225C166.478 57.6175 166.23 57.9425 166.09 58.3975L164.628 57.9475C164.828 57.2525 165.208 56.7 165.768 56.29C166.333 55.88 167.083 55.675 168.018 55.675C168.743 55.675 169.373 55.8 169.908 56.05C170.448 56.295 170.843 56.685 171.093 57.22C171.223 57.485 171.303 57.765 171.333 58.06C171.363 58.355 171.378 58.6725 171.378 59.0125V64H169.99V62.1475L170.26 62.3875C169.925 63.0075 169.498 63.47 168.978 63.775C168.463 64.075 167.828 64.225 167.073 64.225ZM167.35 62.9425C167.795 62.9425 168.178 62.865 168.498 62.71C168.818 62.55 169.075 62.3475 169.27 62.1025C169.465 61.8575 169.593 61.6025 169.653 61.3375C169.738 61.0975 169.785 60.8275 169.795 60.5275C169.81 60.2275 169.818 59.9875 169.818 59.8075L170.328 59.995C169.833 60.07 169.383 60.1375 168.978 60.1975C168.573 60.2575 168.205 60.3175 167.875 60.3775C167.55 60.4325 167.26 60.5 167.005 60.58C166.79 60.655 166.598 60.745 166.428 60.85C166.263 60.955 166.13 61.0825 166.03 61.2325C165.935 61.3825 165.888 61.565 165.888 61.78C165.888 61.99 165.94 62.185 166.045 62.365C166.15 62.54 166.31 62.68 166.525 62.785C166.74 62.89 167.015 62.9425 167.35 62.9425ZM177.96 64C177.45 64.1 176.95 64.1425 176.46 64.1275C175.97 64.1125 175.533 64.0175 175.148 63.8425C174.763 63.6675 174.473 63.3925 174.278 63.0175C174.103 62.6825 174.008 62.3425 173.993 61.9975C173.983 61.6475 173.978 61.2525 173.978 60.8125V53.65H175.553V60.7375C175.553 61.0625 175.555 61.345 175.56 61.585C175.57 61.825 175.623 62.0275 175.718 62.1925C175.898 62.5025 176.183 62.68 176.573 62.725C176.968 62.765 177.43 62.7475 177.96 62.6725V64ZM172.425 57.16V55.9H177.96V57.16H172.425ZM185.353 64V60.0175C185.353 59.7025 185.326 59.38 185.271 59.05C185.221 58.715 185.121 58.405 184.971 58.12C184.826 57.835 184.618 57.605 184.348 57.43C184.083 57.255 183.736 57.1675 183.306 57.1675C183.026 57.1675 182.761 57.215 182.511 57.31C182.261 57.4 182.041 57.5475 181.851 57.7525C181.666 57.9575 181.518 58.2275 181.408 58.5625C181.303 58.8975 181.251 59.305 181.251 59.785L180.276 59.4175C180.276 58.6825 180.413 58.035 180.688 57.475C180.963 56.91 181.358 56.47 181.873 56.155C182.388 55.84 183.011 55.6825 183.741 55.6825C184.301 55.6825 184.771 55.7725 185.151 55.9525C185.531 56.1325 185.838 56.37 186.073 56.665C186.313 56.955 186.496 57.2725 186.621 57.6175C186.746 57.9625 186.831 58.3 186.876 58.63C186.921 58.96 186.943 59.25 186.943 59.5V64H185.353ZM179.661 64V53.2H181.063V59.0275H181.251V64H179.661Z" fill="#002845"/>
          <path d="M208 99L242.569 96.7705L223.354 67.9475L208 99ZM232.129 86.5192L287.664 49.4962L284.336 44.5039L228.801 81.5269L232.129 86.5192Z" fill="#00BDE1"/>
        </svg>
      `;

    if (getDevice() !== "Desktop") {
      message =
        "Element selected! Now go back to the apxor dashboard to proceed";
      uiElementPasteSVG = "";
    }
    const feedbackModal = `
        <style> 
          .apx-container{
            padding:20px;
          }
        </style>
        <div id="apx-container" class="apx-container">
              <div id="close-button" style="position:fixed;top:20px;right:10px;"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.5" d="M11.0962 9.07071L17.8586 15.8331L15.8331 17.8586L9.0707 11.0962L8.99999 11.0255L8.92928 11.0962L2.16693 17.8586L0.141421 15.8331L6.90379 9.07071L6.9745 9L6.90379 8.92929L0.141421 2.16694L2.16693 0.141422L8.92928 6.9038L8.99999 6.97451L9.0707 6.9038L15.8331 0.141422L17.8586 2.16694L11.0962 8.92929L11.0255 9L11.0962 9.07071Z" fill="white" stroke="#002845" stroke-width="0.2"/>
                </svg>
              </div>
              <div style="font-family: 'Manrope';font-style: normal;font-weight: 600;font-size: 16px;line-height: 22px;
              color: #FFFFFF;">${message}</div>
              ${uiElementPasteSVG}
        </div>
      `;
    const feedbackParentDiv = document.createElement("div");
    feedbackParentDiv.style = `
        z-index:99999999;
        background:#002845;
        position:fixed;
        top:50%;
        left:50%;
        transform:translate(-50%, -50%);
      `;
    feedbackParentDiv.innerHTML = feedbackModal;
    document.body.appendChild(feedbackParentDiv);
    const closeButton = document.getElementById("close-button");
    closeButton.addEventListener("click", () => {
      const conatiner = document.getElementById("apx-container");
      conatiner.remove();
      enableViewSelectionBtn.disabled = false;
    });
  };
  /**
   * Hides this button, Shows the Enable View Selection button and remove all attached event listeners
   *
   * At last, show a toast kind of message at the center of the screen
   */
  const disableViewSelectionHandler = () => {
    _hideSelectionMode();

    disableViewSelectionButton.style.display = "none";
    enableViewSelectionButton.style.display = "block";
  };

  disableViewSelectionButton.onclick = disableViewSelectionHandler;

  // Listen on these custom external events to control the show/hide behaviour of the buttons reside in this div
  _wysiwygRoot.addEventListener("preview", disableViewSelectionHandler);
  _wysiwygRoot.addEventListener("added", () => {
    addDeviceButton.style.display = "none";
    removeDeviceButton.style.display = "block";
    buttons.style.display = "flex";
    enableViewSelectionButton.style.display = "block";
  });

  dragElement(node);
};

const _hideSelectionMode = (hideHTML = OFF_HTML) => {
  if (!isSelectionMode) {
    return;
  }
  // Remove the mouseover and mouseout listeners
  window.removeEventListener("mouseover", onMouseOver, true);
  window.removeEventListener("mouseout", onMouseOut, true);
  window.removeEventListener("click", clickListener, true);

  const nodes = document.querySelectorAll(".apx-highlight");
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    node.classList.remove("apx-highlight");
  }

  _hideToast(true, hideHTML);

  isSelectionMode = false;
};

const _hideToast = (hide = false, hideHTML = OFF_HTML) => {
  _viewPickerNode.style.visibility = "visible";
  if (hide) {
    _viewPickerNode.innerHTML = hideHTML;
    _viewPickerNode.style.opacity = 1;
  } else {
    _viewPickerNode.innerHTML = ON_HTML;
    _viewPickerNode.style.opacity = 1;
  }
  setTimeout(() => {
    _viewPickerNode.style.opacity = 0;
    _viewPickerNode.style.visibility = "hidden";
  }, 1000);
};
const createDialog = (
  width,
  min_height,
  {
    dim_background = true,
    dim_bg_color = "#000000",
    dim_bg_opacity = 0.87,
    position,
  }
) => {
  const dialogRoot = document.createElement("div");
  dialogRoot.setAttribute("id", APX_OVERLAY);
  const styleNode = document.createElement("style");
  let justifyContent = "center";
  let alignItems = "center";
  switch (position) {
    case "bottom-left":
      justifyContent = "flex-start";
      alignItems = "flex-end";
      break;
    case "bottom-right":
      justifyContent = "flex-end";
      alignItems = "flex-end";
      break;
    case "top-left":
      justifyContent = "flex-start";
      alignItems = "flex-start";
      break;
    case "top-right":
      justifyContent = "flex-end";
      alignItems = "flex-start";
      break;
    default:
      break;
  }

  let bg_color = "none";
  if (dim_background) {
    const rgb = hexToRgb(dim_bg_color);
    bg_color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, ${dim_bg_opacity})`;
  }

  styleNode.innerHTML = `
#apx-oly {
  width:100%;height:100%;position:fixed;top:0;left:0;background-color:${bg_color};
  display:flex;justify-content:${justifyContent};align-items:${alignItems};border-radius:3px;z-index:2147483647
}
#apx-oly > * {font-family: inherit;box-sizing:unset}
.apx-dlg-c {
  width:${width}px;min-height:${min_height}%;background:white;z-index:99999999;opacity:0;position:relative;visibility:hidden;
  transition:all 500ms cubic-bezier(0, -0.37, 0, 2.06);top:-15px;border-radius:3px;margin:20px
}
.apx-dlg-c.open {opacity:1;visibility:visible;top:0}
  `
    .replaceAll("\n", "")
    .replace(/[\s]{2,999}/g, "");

  const dialogContent = document.createElement("div");
  dialogContent.setAttribute("id", APX_DIALOG_CONTENT);
  dialogContent.classList.add(APX_DIALOG_CONTENT);

  dialogRoot.appendChild(dialogContent);
  dialogRoot.appendChild(styleNode);

  document.body.appendChild(dialogRoot);
  return dialogRoot;
};

const getCookie = (name) => {
  if (window.document) {
    const nameEQ = name + "=";
    const storedCookies = window.document.cookie.split(";");
    for (let i = 0; i < storedCookies.length; i++) {
      let cookie = storedCookies[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(
          cookie.substring(nameEQ.length, cookie.length)
        );
      }
    }
  }
  return null;
};

const uuid = (base) => {
  return [
    Math.random,
    function () {
      return uuid.last ? uuid.last + Math.random() : Math.random();
    },
    Math.random,
    Date.now,
    Math.random,
  ]
    .map(function (fn) {
      return fn()
        .toString(base || 16 + Math.random() * 20)
        .substr(-8);
    })
    .join("-");
};

const getDevice = () => {
  const { navigator: { userAgent = "" } = {} } = window;
  switch (true) {
    case /Windows Phone/i.test(userAgent) || /WPDesktop/.test(userAgent):
      return "Windows Phone";
    case /iPad/.test(userAgent):
      return "iPad";
    case /iPod/.test(userAgent):
      return "iPod Touch";
    case /iPhone/.test(userAgent):
      return "iPhone";
    case /(BlackBerry|PlayBook|BB10)/i.test(userAgent):
      return "BlackBerry";
    case /Android/.test(userAgent):
      return "Android";
    default:
      return "Desktop";
  }
};

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

const _makeSSERequest = (
  type,
  key1,
  key2,
  successCallback = () => {},
  errorCallback = () => {}
) => {
  const deviceInfo = Apxor.getController().getDevInfo();

  const postBody = {
    device_info: {
      id: deviceInfo.id,
      hardware_model: deviceInfo.hardware_model,
      os_version: deviceInfo.os_version,
      width: deviceInfo.dimensions.width,
      height: deviceInfo.dimensions.height,
    },
    screen: {
      image: type,
      navigation: key1,
      orientation: key2,
    },
    layout: [],
  };

  Apxor.getController().makePostRequest(
    LAYOUT_URL.replace("<aid>", Apxor.getSiteId()).replace(
      "<uid>",
      this._vid
    ),
    postBody,
    {},
    successCallback,
    errorCallback
  );
};


window.setTimeout(()=>{
  testDeviceData = Apxor.getController().getFromStorage(
    "_apx_td",
    true
  );
  _createDraggableWYSIWYGOverlay();
},1000)
