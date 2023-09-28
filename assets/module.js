/*! instant.page v3.0.0 - (C) 2019-2020 Alexandre Dieulot - https://instant.page/license */

let mouseoverTimer
let lastTouchTimestamp
const prefetches = new Set()
const prefetchElement = document.createElement('link')
const isSupported = prefetchElement.relList && prefetchElement.relList.supports && prefetchElement.relList.supports('prefetch')
                    && window.IntersectionObserver && 'isIntersecting' in IntersectionObserverEntry.prototype
const allowQueryString = 'instantAllowQueryString' in document.body.dataset
const allowExternalLinks = 'instantAllowExternalLinks' in document.body.dataset
const useWhitelist = 'instantWhitelist' in document.body.dataset

let delayOnHover = 65
let useMousedown = false
let useMousedownOnly = false
let useViewport = false
if ('instantIntensity' in document.body.dataset) {
  const intensity = document.body.dataset.instantIntensity

  if (intensity.substr(0, 'mousedown'.length) == 'mousedown') {
    useMousedown = true
    if (intensity == 'mousedown-only') {
      useMousedownOnly = true
    }
  }
  else if (intensity.substr(0, 'viewport'.length) == 'viewport') {
    if (!(navigator.connection && (navigator.connection.saveData || (navigator.connection.effectiveType && navigator.connection.effectiveType.includes('2g'))))) {
      if (intensity == "viewport") {
        /* Biggest iPhone resolution (which we want): 414 × 896 = 370944
         * Small 7" tablet resolution (which we don’t want): 600 × 1024 = 614400
         * Note that the viewport (which we check here) is smaller than the resolution due to the UI’s chrome */
        if (document.documentElement.clientWidth * document.documentElement.clientHeight < 450000) {
          useViewport = true
        }
      }
      else if (intensity == "viewport-all") {
        useViewport = true
      }
    }
  }
  else {
    const milliseconds = parseInt(intensity)
    if (!isNaN(milliseconds)) {
      delayOnHover = milliseconds
    }
  }
}

if (isSupported) {
  const eventListenersOptions = {
    capture: true,
    passive: true,
  }

  if (!useMousedownOnly) {
    document.addEventListener('touchstart', touchstartListener, eventListenersOptions)
  }

  if (!useMousedown) {
    document.addEventListener('mouseover', mouseoverListener, eventListenersOptions)
  }
  else {
    document.addEventListener('mousedown', mousedownListener, eventListenersOptions)
  }

  if (useViewport) {
    let triggeringFunction
    if (window.requestIdleCallback) {
      triggeringFunction = (callback) => {
        requestIdleCallback(callback, {
          timeout: 1500,
        })
      }
    }
    else {
      triggeringFunction = (callback) => {
        callback()
      }
    }

    triggeringFunction(() => {
      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const linkElement = entry.target
            intersectionObserver.unobserve(linkElement)
            preload(linkElement.href)
          }
        })
      })

      document.querySelectorAll('a').forEach((linkElement) => {
        if (isPreloadable(linkElement)) {
          intersectionObserver.observe(linkElement)
        }
      })
    })
  }
}

function touchstartListener(event) {
  /* Chrome on Android calls mouseover before touchcancel so `lastTouchTimestamp`
   * must be assigned on touchstart to be measured on mouseover. */
  lastTouchTimestamp = performance.now()

  const linkElement = event.target.closest('a')

  if (!isPreloadable(linkElement)) {
    return
  }

  preload(linkElement.href)
}

function mouseoverListener(event) {
  if (performance.now() - lastTouchTimestamp < 1100) {
    return
  }

  const linkElement = event.target.closest('a')

  if (!isPreloadable(linkElement)) {
    return
  }

  linkElement.addEventListener('mouseout', mouseoutListener, {passive: true})

  mouseoverTimer = setTimeout(() => {
    preload(linkElement.href)
    mouseoverTimer = undefined
  }, delayOnHover)
}

function mousedownListener(event) {
  const linkElement = event.target.closest('a')

  if (!isPreloadable(linkElement)) {
    return
  }

  preload(linkElement.href)
}

function mouseoutListener(event) {
  if (event.relatedTarget && event.target.closest('a') == event.relatedTarget.closest('a')) {
    return
  }

  if (mouseoverTimer) {
    clearTimeout(mouseoverTimer)
    mouseoverTimer = undefined
  }
}

function isPreloadable(linkElement) {
  if (!linkElement || !linkElement.href) {
    return
  }

  if (useWhitelist && !('instant' in linkElement.dataset)) {
    return
  }

  if (!allowExternalLinks && linkElement.origin != location.origin && !('instant' in linkElement.dataset)) {
    return
  }

  if (!['http:', 'https:'].includes(linkElement.protocol)) {
    return
  }

  if (linkElement.protocol == 'http:' && location.protocol == 'https:') {
    return
  }

  if (!allowQueryString && linkElement.search && !('instant' in linkElement.dataset)) {
    return
  }

  if (linkElement.hash && linkElement.pathname + linkElement.search == location.pathname + location.search) {
    return
  }

  if ('noInstant' in linkElement.dataset) {
    return
  }

  return true
}

function preload(url) {
  if (prefetches.has(url)) {
    return
  }

  const prefetcher = document.createElement('link')
  prefetcher.rel = 'prefetch'
  prefetcher.href = url
  document.head.appendChild(prefetcher)

  prefetches.add(url)
}

// min 3.0
// data-instant-allow-query-string data-instant-allow-external-links
let mouseoverTimer,lastTouchTimestamp;const prefetches=new Set,prefetchElement=document.createElement("link"),isSupported=prefetchElement.relList&&prefetchElement.relList.supports&&prefetchElement.relList.supports("prefetch")&&window.IntersectionObserver&&"isIntersecting"in IntersectionObserverEntry.prototype,allowQueryString="instantAllowQueryString"in document.body.dataset,allowExternalLinks="instantAllowExternalLinks"in document.body.dataset,useWhitelist="instantWhitelist"in document.body.dataset;let delayOnHover=65,useMousedown=!1,useMousedownOnly=!1,useViewport=!1;if("instantIntensity"in document.body.dataset){const e=document.body.dataset.instantIntensity;if("mousedown"==e.substr(0,"mousedown".length))useMousedown=!0,"mousedown-only"==e&&(useMousedownOnly=!0);else if("viewport"==e.substr(0,"viewport".length))navigator.connection&&(navigator.connection.saveData||navigator.connection.effectiveType&&navigator.connection.effectiveType.includes("2g"))||("viewport"==e?document.documentElement.clientWidth*document.documentElement.clientHeight<45e4&&(useViewport=!0):"viewport-all"==e&&(useViewport=!0));else{const t=parseInt(e);isNaN(t)||(delayOnHover=t)}}if(isSupported){const e={capture:!0,passive:!0};if(useMousedownOnly||document.addEventListener("touchstart",touchstartListener,e),useMousedown?document.addEventListener("mousedown",mousedownListener,e):document.addEventListener("mouseover",mouseoverListener,e),useViewport){let e;(e=window.requestIdleCallback?e=>{requestIdleCallback(e,{timeout:1500})}:e=>{e()})(()=>{const e=new IntersectionObserver(t=>{t.forEach(t=>{if(t.isIntersecting){const o=t.target;e.unobserve(o),preload(o.href)}})});document.querySelectorAll("a").forEach(t=>{isPreloadable(t)&&e.observe(t)})})}}function touchstartListener(e){lastTouchTimestamp=performance.now();const t=e.target.closest("a");isPreloadable(t)&&preload(t.href)}function mouseoverListener(e){if(performance.now()-lastTouchTimestamp<1100)return;const t=e.target.closest("a");isPreloadable(t)&&(t.addEventListener("mouseout",mouseoutListener,{passive:!0}),mouseoverTimer=setTimeout(()=>{preload(t.href),mouseoverTimer=void 0},delayOnHover))}function mousedownListener(e){const t=e.target.closest("a");isPreloadable(t)&&preload(t.href)}function mouseoutListener(e){e.relatedTarget&&e.target.closest("a")==e.relatedTarget.closest("a")||mouseoverTimer&&(clearTimeout(mouseoverTimer),mouseoverTimer=void 0)}function isPreloadable(e){if(e&&e.href&&(!useWhitelist||"instant"in e.dataset)&&(allowExternalLinks||e.origin==location.origin||"instant"in e.dataset)&&["http:","https:"].includes(e.protocol)&&("http:"!=e.protocol||"https:"!=location.protocol)&&(allowQueryString||!e.search||"instant"in e.dataset)&&!(e.hash&&e.pathname+e.search==location.pathname+location.search||"noInstant"in e.dataset))return!0}function preload(e){if(prefetches.has(e))return;const t=document.createElement("link");t.rel="prefetch",t.href=e,document.head.appendChild(t),prefetches.add(e)}

// min 1.2.1
let urlToPreload,mouseoverTimer,lastTouchTimestamp;const prefetcher=document.createElement("link"),isSupported=prefetcher.relList&&prefetcher.relList.supports&&prefetcher.relList.supports("prefetch"),isDataSaverEnabled=navigator.connection&&navigator.connection.saveData,allowQueryString="instantAllowQueryString"in document.body.dataset,allowExternalLinks="instantAllowExternalLinks"in document.body.dataset;if(isSupported&&!isDataSaverEnabled){prefetcher.rel="prefetch",document.head.appendChild(prefetcher);const e={capture:!0,passive:!0};document.addEventListener("touchstart",touchstartListener,e),document.addEventListener("mouseover",mouseoverListener,e)}function touchstartListener(e){lastTouchTimestamp=performance.now();const t=e.target.closest("a");isPreloadable(t)&&(t.addEventListener("touchcancel",touchendAndTouchcancelListener,{passive:!0}),t.addEventListener("touchend",touchendAndTouchcancelListener,{passive:!0}),urlToPreload=t.href,preload(t.href))}function touchendAndTouchcancelListener(){urlToPreload=void 0,stopPreloading()}function mouseoverListener(e){if(performance.now()-lastTouchTimestamp<1100)return;const t=e.target.closest("a");isPreloadable(t)&&(t.addEventListener("mouseout",mouseoutListener,{passive:!0}),urlToPreload=t.href,mouseoverTimer=setTimeout(function(){preload(t.href),mouseoverTimer=void 0},65))}function mouseoutListener(e){e.relatedTarget&&e.target.closest("a")==e.relatedTarget.closest("a")||(mouseoverTimer?(clearTimeout(mouseoverTimer),mouseoverTimer=void 0):(urlToPreload=void 0,stopPreloading()))}function isPreloadable(e){if(!e||!e.href)return;if(urlToPreload==e.href)return;const t=new URL(e.href);return!(!(allowExternalLinks||t.origin==location.origin||"instant"in e.dataset)||!["http:","https:"].includes(t.protocol)||"http:"==t.protocol&&"https:"==location.protocol||!(allowQueryString||!t.search||"instant"in e.dataset)||t.hash&&t.pathname+t.search==location.pathname+location.search||"noInstant"in e.dataset)||void 0}function preload(e){prefetcher.href=e}function stopPreloading(){prefetcher.removeAttribute("href")}