# web viewport responsive solution
* Apply to responsive pages
* base standard width is 750
* base standard height is 1334

## Usage
```javascript
// es6
import viewportInit from './viewport.js'
viewportInit(window, { px_to_rem: 100 })
```

## options: { px_to_rem: number, fixHeight: bool }
* px_to_rem: 1个rem对应多少px
* fixHeight: 是否以视口高度来计算比例