function viewportInit(win, options) {
    const doc = win.document
    const docEl = doc.documentElement
    let metaEl = doc.querySelector('meta[name="viewport"]')
    let dpr = 0
    let scale = 0
    let resizeTimeout
    const isAndroid = win.navigator.appVersion.match(/android/gi)
    const isIPhone = win.navigator.appVersion.match(/iphone/gi)

    options = options || {}

    if (metaEl) {
        console.warn('将根据已有的meta标签来设置缩放比例')
        const match = metaEl.getAttribute('content').match(/initial-scale=([\d.]+)/)
        if (match) {
            scale = parseFloat(match[1])
            dpr = parseInt(1 / scale, 10)
        }
    }

    if (!dpr && !scale) {
        const devicePixelRatio = win.devicePixelRatio
        if (isIPhone) {
            // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
            if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
                dpr = 3
            } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
                dpr = 2
            } else {
                dpr = 1
            }
        } else {
            // 其他设备下，仍旧使用1倍的方案
            dpr = 1
        }
        scale = 1 / dpr
    }

    docEl.setAttribute('data-dpr', dpr)

    if (!metaEl) {
        metaEl = doc.createElement('meta')
        metaEl.setAttribute('name', 'viewport')
        metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no')
        if (docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl)
        } else {
            const wrap = doc.createElement('div')
            wrap.appendChild(metaEl)
            doc.write(wrap.innerHTML)
        }
    }

    function os() {
        const ua = navigator.userAgent
        const isWindowsPhone = /(?:Windows Phone)/.test(ua)
        const isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone
        const _isAndroid = /(?:Android)/.test(ua)
        const isFireFox = /(?:Firefox)/.test(ua)
        const isChrome = /(?:Chrome|CriOS)/.test(ua)
        const isTablet = /(?:iPad|PlayBook)/.test(ua) || (_isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua))
        const isPhone = /(?:iPhone)/.test(ua) && !isTablet
        const isPc = !isPhone && !_isAndroid && !isSymbian && !isTablet
        return {
            isTablet: isTablet,
            isPhone: isPhone,
            isAndroid: _isAndroid,
            isPc: isPc
        }
    }

    function refreshRem() {
        if (!os().isPc) {
            const isPad = document.documentElement.clientWidth >= 768 && document.documentElement.clientWidth <= 1024
            const isBiggerPad = document.documentElement.clientWidth > 1024
            const threshold = isPad ? 0.70 : isBiggerPad ? 0.90 : 0.50
            const rem = options.fixHeight ?
                Math.min(document.documentElement.clientHeight / 1334, document.documentElement.clientWidth / 750)
                : document.documentElement.clientWidth / 750
            const fontSize = (options.px_to_rem || 75) * rem
            // const fontSize = Math.min((options.px_to_rem || 75) * rem, threshold)
            docEl.style.fontSize = `${fontSize}px`

            win.REM = rem
        } else {
            win.REM = 1
            docEl.style.fontSize = `${options.px_to_rem / 2 || 75}px`
            docEl.style.width = '750px'
            docEl.style.margin = '0 auto'
            docEl.style.position = 'relative'
        }
    }

    win.addEventListener('resize', function resize() {
        if (window.inputOnFocus) {
            return
        }

        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(refreshRem, 300)
    }, false)

    win.addEventListener('pageshow', function pageshow(e) {
        if (e.persisted) {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(refreshRem, 300)
        }
    }, false)

    // 字体用px, 不适用可注释,chrome mini is 12px;
    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = `${12 * dpr}px`
    } else {
        doc.addEventListener('DOMContentLoaded', function (e) {
            doc.body.style.fontSize = `${12 * dpr}px`
        }, false)
    }

    refreshRem()
}

export default viewportInit
