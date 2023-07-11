const APX_OVERLAY = "apx-oly";
const APX_DIALOG_CONTENT = "apx-dlg-c";
const APX_PREVIEW_CAMPAIGN_NAME = "APX-PR3VI3W-CAMPGAIN";

const ON_HTML = "<b>View Selection Mode: ON";
const OFF_HTML = "<b>View Selection Mode: OFF</b>";

const SSE_API = "https://server.apxor.com/v1/sse/";
const LAYOUT_URL =
  SSE_API + "layout?appId=b0bf1fc7-b104-4e92-9cc5-590fcb685c29&deviceId=<uid>";
const PREVIEW_API = SSE_API + "ui-config?appId=<aid>&deviceId=<uid>";
const CONFIG_API = SSE_API + "art-config?appId=<aid>&deviceId=<uid>";

const FRONTEND_API = "https://server.apxor.com/v4/frontendapi/web/test-devices";
const ADD_TEST_DEVICE_API =
  FRONTEND_API + "?appId=b0bf1fc7-b104-4e92-9cc5-590fcb685c29";
const REMOVE_TEST_DEVICE_API =
  FRONTEND_API + "/<uid>?appId=b0bf1fc7-b104-4e92-9cc5-590fcb685c29";

const BROWSERS = {
  OperaMini: "Opera Mini",
  Opera: "Opera",
  BlackBerry: "BlackBerry",
  IEMobile: "Internet Explorer Mobile",
  Edge: "Microsoft Edge",
  FB: "Facebook Mobile",
  Chrome: "Chrome",
  ChromeIOS: "Chrome iOS",
  UC: "UC Browser",
  FirefoxIOS: "Firefox iOS",
  SafariMobile: "Mobile Safari",
  Safari: "Safari",
  AndroidMobile: "Android Mobile",
  Konqueror: "Konqueror",
  Firefox: "Firefox",
  IE: "Internet Explorer",
  Mozilla: "Mozilla",
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

const getDeviceInfo = (window = {}) => {
  const { navigator: { userAgent = "", vendor = "" } = {} } = window;

  const {
    OperaMini,
    Opera,
    BlackBerry,
    IEMobile,
    Edge,
    FB,
    Chrome,
    ChromeIOS,
    UC,
    FirefoxIOS,
    SafariMobile,
    Safari,
    AndroidMobile,
    Konqueror,
    Firefox,
    IE,
    Mozilla,
  } = BROWSERS;

  /**
   * Browser
   * @returns {string}
   */
  const getBrowser = () => {
    switch (true) {
      case userAgent.includes(" OPR/"):
        return userAgent.includes("Mini") ? OperaMini : Opera;
      case /(BlackBerry|PlayBook|BB10)/i.test(userAgent):
        return BlackBerry;
      case userAgent.includes("IEMobile") || userAgent.includes("WPDesktop"):
        return IEMobile;
      case userAgent.includes("FBIOS"):
        return FB;
      case userAgent.includes("Chrome"):
        return Chrome;
      case userAgent.includes("CriOS"):
        return ChromeIOS;
      case userAgent.includes("Edge"):
        return Edge;
      case userAgent.includes("UCWEB") || userAgent.includes("UCBrowser"):
        return UC;
      case userAgent.includes("FxiOS"):
        return FirefoxIOS;
      case vendor.includes("Apple"):
        return userAgent.includes("Mobile") ? SafariMobile : Safari;
      case userAgent.includes("Android"):
        return AndroidMobile;
      case userAgent.includes("Konqueror"):
        return Konqueror;
      case userAgent.includes("Firefox"):
        return Firefox;
      case userAgent.includes("MSIE") || userAgent.includes("Trident/"):
        return IE;
      case userAgent.includes("Gecko"):
        return Mozilla;
      default:
        return ""; //FIXME don't know what to return :(
    }
  };

  const browser = getBrowser();

  /**
   * Browser Version
   * @returns {*}
   */
  const getBrowserVersion = () => {
    const versionRegEx = {
      [IEMobile]: /rv:(\d+(\.\d+)?)/,
      [Edge]: /Edge\/(\d+(\.\d+)?)/,
      [Chrome]: /Chrome\/(\d+(\.\d+)?)/,
      [ChromeIOS]: /CriOS\/(\d+(\.\d+)?)/,
      [UC]: /(UCBrowser|UCWEB)\/(\d+(\.\d+)?)/,
      [Safari]: /Version\/(\d+(\.\d+)?)/,
      [SafariMobile]: /Version\/(\d+(\.\d+)?)/,
      [Opera]: /(Opera|OPR)\/(\d+(\.\d+)?)/,
      [Firefox]: /Firefox\/(\d+(\.\d+)?)/,
      [FirefoxIOS]: /FxiOS\/(\d+(\.\d+)?)/,
      [Konqueror]: /Konqueror:(\d+(\.\d+)?)/,
      [BlackBerry]: /BlackBerry (\d+(\.\d+)?)/,
      [AndroidMobile]: /android\s(\d+(\.\d+)?)/,
      [IE]: /(rv:|MSIE )(\d+(\.\d+)?)/,
      [Mozilla]: /rv:(\d+(\.\d+)?)/,
    }[browser];
    if (versionRegEx === undefined) {
      return null;
    }
    const matches = userAgent.match(versionRegEx);
    if (!matches) {
      return null;
    }
    return parseFloat(matches[matches.length - 2]);
  };

  /**
   * OS
   * @returns {string}
   */
  const getOS = () => {
    switch (true) {
      case /Windows/i.test(userAgent):
        return /Phone/.test(userAgent) || /WPDesktop/.test(userAgent)
          ? "Windows Phone"
          : "Windows";
      case /(iPhone|iPad|iPod)/.test(userAgent):
        return "iOS";
      case /Android/.test(userAgent):
        return "Android";
      case /(BlackBerry|PlayBook|BB10)/i.test(userAgent):
        return "BlackBerry";
      case /Mac/i.test(userAgent):
        return "Mac OS X";
      case /Linux/.test(userAgent):
        return "Linux";
      case /CrOS/.test(userAgent):
        return "Chrome OS";
      default:
        return "";
    }
  };

  /**
   * Device Dimensions
   * @returns {{dimensions: {}, dimensions_in_pixels: {}, dpi: string}}
   */
  const getDimensions = () => {
    const {
      screen: { height, width } = { width: 0, height: 0 },
      devicePixelRatio = 1,
    } = window;
    const roundedDimension = (dim) => {
      //1918.6773494 ==> 1920
      const mul = Math.round(dim) * devicePixelRatio;
      const mod = mul % 10;
      return mul + (mod > 0 ? 10 : 0) - mod;
    };
    return {
      dimensions: {
        width,
        height,
      },
      dimensions_in_pixels: {
        width: roundedDimension(width),
        height: roundedDimension(height),
      },
      dpi: devicePixelRatio.toString(),
    };
  };

  const browser_version = getBrowserVersion();
  const device = getDevice();
  const os = getOS();

  return {
    ...getDimensions(),
    device,
    browser_version,
    browser,
    os,
  };
};

class WYSIWYG {
  _styleNode = null;
  _viewPickerNode = null;
  _addRemoveTestDeviceDialog = null;
  _wysiwygRoot = null;
  _vid = "";
  _type = getDevice();
  constructor() {}

  init = (siteId, rtmInstance) => {
    try {
      if (siteId) {
        // No need to delete the cookie as it will be taken care by the Browser
        // deleteCookie("_apx_ew");

        // Create a node which display a small div at the center of the screen
        // When view selection is enabled/disabled
        const node = document.createElement("span");
        node.style =
          "z-index:99999999;visibility:hidden;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:16px 24px;background:#252f37;border-radius:3px;opacity:0;font-size:24px;color:white;transition:all .3s ease-out";
        node.innerHTML = ON_HTML;
        this._viewPickerNode = node;
        document.body.appendChild(node);

        // Create the style node which will be used to highlight the views upon mouse hover
        this._styleNode = document.createElement("style");
        this._styleNode.innerHTML =
          ".apx-highlight{height:auto;z-index:9999999999;outline: 2px solid red;cursor:default}";
        document.body.appendChild(this._styleNode);

        this.isSelectionMode = false;

        // Get the existind test device information, if this is user is already marked this as a test device
        this.testDeviceData = Apxor.getController().getFromStorage(
          "_apx_td",
          true
        );
        if (this.testDeviceData) {
          const { name = "", id = "" } = this.testDeviceData;

          // If both ID and NAME exists, then send this device as selected device for preview and testing
          // Also, wait for the preview messages from SSE server
          if (name !== "" && id !== "") {
            this._makeSSERequest("select", `${name} - ${id}`, id);

            const previewEventSource = new EventSource(
              PREVIEW_API.replace("<aid>", siteId).replace("<uid>", id)
            );
            const artConfigEventSource = new EventSource(
              CONFIG_API.replace("<aid>", siteId).replace("<uid>", id)
            );
            previewEventSource.onmessage = artConfigEventSource.onmessage = (
              e
            ) => {
              if (e && e.data && e.data !== "{}") {
                this._handleSSEResponse(rtmInstance, e.data);
              }
            };
          }
        }

        this._createDraggableWYSIWYGOverlay(rtmInstance);
      }
    } catch (e) {
      window.ApxorLogger.error("WYSIWYG can not be initialised");
    }
    //this._createDraggableWYSIWYGOverlay(rtmInstance);
  };

  tearDown = () => {
    // TODO: Make sure all cleanups are properly done
    this._viewPickerNode.parentNode.removeChild(this._viewPickerNode);
    this._styleNode.parentNode.removeChild(this._styleNode);
  };

  /**
   * Dashboard sends the preview or testing configurations over an SSE connection
   *
   * Interprets the command and performs necessary action
   */
  _handleSSEResponse = (rtmInstance, json) => {
    try {
      this._wysiwygRoot.dispatchEvent(new CustomEvent("preview"));
      const data = JSON.parse(json);
      const { cmd: command = "prev" } = data;
      if (command === "prev") {
        if (data?.ui) {
          const id = uuid(36);
          const response = {
            configs: [
              {
                _id: id,
                enabled: true,
                terminate_info: {
                  auto_dismiss: false,
                  duration: 1000,
                },
                meta: {
                  name: APX_PREVIEW_CAMPAIGN_NAME,
                  type: data.type,
                },
                ui: data.ui,
              },
            ],
          };
          rtmInstance._storeConfigs(data.type !== "SURVEY" ? 0 : 1, response);
          Apxor.getController().dispatchEvent(data.type, {
            name: data.type,
            additional_info: {
              uuid: id,
              name: APX_PREVIEW_CAMPAIGN_NAME,
            },
          });
        } else if (data?.messages) {
          const surveys = [];
          const walkthroughs = [];
          data.messages.forEach((message) => {
            if (message.meta.type !== "SURVEY") {
              walkthroughs.push(message);
            } else {
              surveys.push(message);
            }
          });

          if (walkthroughs.length > 0) {
            rtmInstance.handleResponse(0, {
              configs: walkthroughs,
            });
          }

          if (surveys.length > 0) {
            rtmInstance.handleResponse(1, {
              configs: surveys,
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Creates a draggable div which contains the following options
   *
   * - Add as Test Device
   * - Remove Test Device
   * - Enable View Selection Mode
   * - Disable View Selection Mode
   */
  _createDraggableWYSIWYGOverlay = (rtmInstance) => {
    const isAdded =
      this.testDeviceData !== null &&
      this.testDeviceData !== undefined &&
      this.testDeviceData.id &&
      this.testDeviceData.name;

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
            isAdded && this.isSelectionMode
              ? "none"
              : isAdded
              ? "block"
              : "none"
          }">
              Enable view selection
          </button>
          <button class="apx-b" id="apx-dv" style="display:${
            isAdded && this.isSelectionMode ? "block" : "none"
          }">
              Disable view selection
          </button>
          <button class="apx-b" id="apx-close" style="display:block">
            Close
          </button>
          <button class="apx-b" id="apx-clean" style="display:block">
            Clear Events
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
    this._wysiwygRoot = node;

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
    const closeButton = document.getElementById("apx-close");
    const cleanButton = document.getElementById("apx-clean");

    addDeviceButton.onclick = () => this._showAddTestDeviceDialog(rtmInstance);

    removeDeviceButton.onclick = () => {
      // Make remove API call
      fetch(
        REMOVE_TEST_DEVICE_API.replace("<aid>", Apxor.getSiteId()).replace(
          "<uid>",
          this.testDeviceData.id
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
            this.testDeviceData = null;

            addDeviceButton.style.display = "block";
            removeDeviceButton.style.display =
              enableViewSelectionButton.style.display =
              disableViewSelectionButton.style.display =
                "none";

            if (this.isSelectionMode) {
              this._hideSelectionMode();
            }
          }
        })
        .catch((e) => console.error(e));
    };

    closeButton.onclick = () => {
      document.body.removeChild(node);
    };

    cleanButton.onclick = () => {
      Apxor.getController().persistToStorage("_apx_paths", {}, true);
    };
    /**
     * Hides this button, Shows the Disable View Selection button and attach some event listeners
     *
     * At last, show a toast kind of message at the center of the screen
     */
    enableViewSelectionButton.onclick = () => {
      this.isSelectionMode = true;

      // Attach the mouseover and mouseout listeners
      window.addEventListener("mouseover", onMouseOver, true);
      window.addEventListener("mouseout", onMouseOut, true);
      this.clickListener = (e) =>
        handleDocumentOnClick(e, (target) => {
          // Send this information over to SSE server which will send this info to dashboard
          const cssSelector = this.cssPath(target, true);
          const xPath = this.xPath(target, true);
          //copying value to the clipboard
          navigator.clipboard.writeText(cssSelector + "___" + xPath);

          //creating container for indicating user to paste the code in dashboard
          showFeedbackAfterViewIdCopy(cssSelector);
          //disabling the view seletion after showing the container
          disableViewSelectionHandler();
          //   this._makeSSERequest(
          //     "view",
          //     location.href,
          //     cssSelector + "___" + xPath
          //   );
        });
      window.addEventListener("click", this.clickListener, true);

      this._hideToast(false);

      enableViewSelectionButton.style.display = "none";
      disableViewSelectionButton.style.display = "block";
    };

    const showFeedbackAfterViewIdCopy = (cssSelector) => {
      const enableViewSelectionBtn = document.querySelector("#apx-ev");
      enableViewSelectionBtn.disabled = true;

      let message = "Enter the event name";

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
              <input id="apx-event-name"></input>
              <button id="apx-name-submit">Submit</button>
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
      const closeButton = feedbackParentDiv.getElementById("close-button");
      closeButton.addEventListener("click", () => {
        const conatiner = document.getElementById("apx-container");
        conatiner.remove();
        enableViewSelectionBtn.disabled = false;
      });

      const evNameSubmitButton =
        feedbackParentDiv.getElementById("apx-name-submit");
      evNameSubmitButton.addEventListener("click", () => {
        const evNameInput = feedbackParentDiv.getElementById("apx-event-name");
        const conatiner = document.getElementById("apx-container");
        const name = evNameInput.value || "A_BUTTON";

        let selectors = Apxor.getController().getFromStorage(
          "_apx_paths",
          true
        );

        let pathname = location.pathname;
        if (!selectors) {
          selectors = {};
        }

        if (!selectors[pathname]) {
          selectors[pathname] = {};
        }

        if (!selectors[pathname][cssSelector]) {
          selectors[pathname][cssSelector] = {};
        }
        selectors[pathname][cssSelector] = name;
        Apxor.getController().persistToStorage("_apx_paths", selectors, true);

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
      this._hideSelectionMode();

      disableViewSelectionButton.style.display = "none";
      enableViewSelectionButton.style.display = "block";
    };

    disableViewSelectionButton.onclick = disableViewSelectionHandler;

    // Listen on these custom external events to control the show/hide behaviour of the buttons reside in this div
    this._wysiwygRoot.addEventListener("preview", disableViewSelectionHandler);
    this._wysiwygRoot.addEventListener("added", () => {
      addDeviceButton.style.display = "none";
      removeDeviceButton.style.display = "block";
      buttons.style.display = "flex";
      enableViewSelectionButton.style.display = "block";
    });

    dragElement(node);
  };

  _hideSelectionMode = (hideHTML = OFF_HTML) => {
    if (!this.isSelectionMode) {
      return;
    }
    // Remove the mouseover and mouseout listeners
    window.removeEventListener("mouseover", onMouseOver, true);
    window.removeEventListener("mouseout", onMouseOut, true);
    window.removeEventListener("click", this.clickListener, true);

    const nodes = document.querySelectorAll(".apx-highlight");
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      node.classList.remove("apx-highlight");
    }

    this._hideToast(true, hideHTML);

    this.isSelectionMode = false;
  };

  _hideToast = (hide = false, hideHTML = OFF_HTML) => {
    this._viewPickerNode.style.visibility = "visible";
    if (hide) {
      this._viewPickerNode.innerHTML = hideHTML;
      this._viewPickerNode.style.opacity = 1;
    } else {
      this._viewPickerNode.innerHTML = ON_HTML;
      this._viewPickerNode.style.opacity = 1;
    }
    setTimeout(() => {
      this._viewPickerNode.style.opacity = 0;
      this._viewPickerNode.style.visibility = "hidden";
    }, 1000);
  };

  /**
   * Dialog that shows helps to add this device as test device
   */
  _showAddTestDeviceDialog = (rtmInstance) => {
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
    if (this.testDeviceData) {
      input.value = this.testDeviceData?.name ?? "";
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

          this.testDeviceData = newInfo;

          this._makeSSERequest("select", `${input.value} - ${id}`, id, () => {
            dialogContent.children[1].classList.remove("apx-loading");
            this._wysiwygRoot.dispatchEvent(new CustomEvent("added"));
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
              this._handleSSEResponse(rtmInstance, e.data);
            }
          };

          hideDialog();
        },
        () => {}
      );
    };
  };

  /**
   * Helper SSE code to send the commands in a reusable way
   */
  _makeSSERequest = (
    type,
    key1,
    key2,
    successCallback = () => {},
    errorCallback = () => {}
  ) => {
    const deviceInfo = getDeviceInfo(window);

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

  // Below 5 helper methods were grabbed from
  // https://chromium.googlesource.com/chromium/blink/+/refs/heads/main/Source/devtools/front_end/components/DOMPresentationUtils.js

  // Above URL has a bug, below is the URL with proper fix
  // https://github.com/ChromeDevTools/devtools-frontend/blob/master/front_end/panels/elements/DOMPath.ts

  cssPath = (node, optimized) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    var steps = [];
    var contextNode = node;
    while (contextNode) {
      var step = this._cssPathStep(
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

  _cssPathStep = (node, optimized, isTargetNode) => {
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

  xPath = (node, optimized) => {
    if (node.nodeType === Node.DOCUMENT_NODE) return "/";
    var steps = [];
    var contextNode = node;
    while (contextNode) {
      var step = this._xPathValue(contextNode, optimized);
      if (!step) break; // Error - bail out early.
      steps.push(step);
      if (step.optimized) break;
      contextNode = contextNode.parentNode;
    }
    steps.reverse();
    return (steps.length && steps[0].optimized ? "" : "/") + steps.join("/");
  };

  _xPathValue = (node, optimized) => {
    var ownValue;
    var ownIndex = this._xPathIndex(node);
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

  _xPathIndex = (node) => {
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
}

const DOMNodePathStep = function (value, optimized) {
  this.value = value;
  this.optimized = optimized || false;
};

DOMNodePathStep.prototype = {
  toString: function () {
    return this.value;
  },
};

window.setTimeout(() => {
  let selectors = Apxor.getController().getFromStorage("_apx_paths", true);
  let paths = Object.keys(selectors);
  paths.forEach((path) => {
    if (path === location.pathname) {
      const elementSelectors = Object.keys(selectors[path]);
      elementSelectors.forEach((selector) => {
        const ele = document.querySelector(selector);
        if (ele !== null || ele !== undefined) {
          ele.onclick = (e) => {
            Apxor.logEvent(selectors[path][selector]);
            console.log("Event name is:", selectors[path][selector]);
          };
        }
      });
    }
  });

  let _wysiwyg = new WYSIWYG();
  _wysiwyg.init("b0bf1fc7-b104-4e92-9cc5-590fcb685c29", ApxorRTM);
}, 1000);
