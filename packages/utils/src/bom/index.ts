// 获取url参数
export function getUrlParams(name: string): string {
  const url = location.href
  const temp1 = url.split('?')
  const pram = temp1[1]
  const keyValue = pram.split('&')
  const obj = {}
  for (let i = 0; i < keyValue.length; i++) {
    const item = keyValue[i].split('=')
    const key = item[0]
    const value = item[1]
    obj[key] = value
  }
  return obj[name]
}

// 修改url中的参数的值
export function replaceParamVal(paramName: string, replaceWith: string): string {
  var oUrl = location.href.toString()
  var re = eval('/(' + paramName + '=)([^&]*)/gi')
  location.href = oUrl.replace(re, paramName + '=' + replaceWith)
  return location.href
}

// 获取窗口可视范围的高度
export function getClientHeight() {
  let clientHeight = 0
  if (document.body.clientHeight && document.documentElement.clientHeight) {
    clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
  }
  else {
    clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
  }
  return clientHeight
}

// 获取窗口可视范围宽度
export function getPageViewWidth() {
  let d = document,
    a = d.compatMode == 'BackCompat' ? d.body : d.documentElement
  return a.clientWidth
}

// 获取窗口宽度
export function getPageWidth() {
  let g = document,
    a = g.body,
    f = g.documentElement,
    d = g.compatMode == "BackCompat" ? a : g.documentElement
  return Math.max(f.scrollWidth, a.scrollWidth, d.clientWidth)
}

// 获取窗口尺寸
export function getViewportOffset() {
  if (window.innerWidth) {
    return {
      w: window.innerWidth,
      h: window.innerHeight
    }
  } else {
    // ie8及其以下
    if (document.compatMode === 'BackCompat') {
      // 怪异模式
      return {
        w: document.body.clientWidth,
        h: document.body.clientHeight
      }
    } else {
      // 标准模式
      return {
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight
      }
    }
  }
}

// 获取滚动条距顶部高度
export function getPageScrollTop() {
  const a = document
  return a.documentElement.scrollTop || a.body.scrollTop
}

// 获取滚动条距左边的高度
export function getPageScrollLeft() {
  let a = document
  return a.documentElement.scrollLeft || a.body.scrollLeft
}

// 开启全屏
export function launchFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullScreen()
  }
}

// 关闭全屏
export function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
    // @ts-ignore
  } else if (document.msExitFullscreen) {
    // @ts-ignore
    document.msExitFullscreen()
    // @ts-ignore
  } else if (document.mozCancelFullScreen) {
    // @ts-ignore
    document.mozCancelFullScreen()
    // @ts-ignore
  } else if (document.webkitExitFullscreen) {
    // @ts-ignore
    document.webkitExitFullscreen()
  }
}

// 返回当前滚动条位置
export const getScrollPosition = (el = window) => ({
  // @ts-ignore
  x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
  // @ts-ignore
  y: el.pageYOffset !== undefined ? el.pageYOffset : el.scrollTop
})

// 滚动到指定元素区域
export const smoothScroll = element => {
  document.querySelector(element).scrollIntoView({
    behavior: 'smooth'
  })
}

// 平滑滚动到页面顶部
export const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop)
    window.scrollTo(0, c - c / 8)
  }
}

// http跳转https
export const httpsRedirect = () => {
  if (location.protocol !== 'https:') location.replace('https://' + location.href.split('//')[1])
}

// 检查页面底部是否可见
export const bottomVisible = () => {
  return document.documentElement.clientHeight + window.scrollY >=
    (document.documentElement.scrollHeight || document.documentElement.clientHeight)
}

// 打开一个窗口
export function openWindow(url, windowName, width, height) {
  // @ts-ignore
  var x = parseInt(screen.width / 2.0) - width / 2.0
  // @ts-ignore
  var y = parseInt(screen.height / 2.0) - height / 2.0
  var isMSIE = navigator.appName == "Microsoft Internet Explorer"
  if (isMSIE) {
    var p = "resizable=1,location=no,scrollbars=no,width="
    p = p + width
    p = p + ",height="
    p = p + height
    p = p + ",left="
    p = p + x
    p = p + ",top="
    p = p + y
    window.open(url, windowName, p)
  } else {
    var win = window.open(
      url,
      "ZyiisPopup",
      "top=" +
      y +
      ",left=" +
      x +
      ",scrollbars=" +
      scrollbars +
      ",dialog=yes,modal=yes,width=" +
      width +
      ",height=" +
      height +
      ",resizable=no"
    )
    eval("try { win.resizeTo(width, height); } catch(e) { }")
    // @ts-ignore
    win.focus();
  }
}

// 自适应页面（rem）
export function AutoResponse(width = 750) {
  const target = document.documentElement
  target.clientWidth >= 600
    ? (target.style.fontSize = '80px')
    : (target.style.fontSize = target.clientWidth / width * 100 + 'px')
}