var hexContrastCheck = require('wcag-contrast').hex
var convertCssColorNameToHex = require('convert-css-color-name-to-hex')


var DEFAULT_INPUT = {
  pageBackground: "#FFFFFF",
  objectBackground: "#5A9BCC",
  textColour: "#000000",
  appliedAlpha: "#5A9BCC",
  alphaChannel: "100"
}

// https://github.com/LeaVerou/contrast-ratio/blob/gh-pages/contrast-ratio.js
var levels = {
  "fail": {
    title: "Fail",
    color: "hsl(0, 100%, 40%)"
  },
  "pass": {
    title: "Pass",
    color: "hsl(142, 100%, 26%)"
  }
};

function roundNumber (number) {
  // Truncate the number without rounding up
  number = Math.floor(number * 100) / 100
  // If it's a whole number round up.
  if (number % 1 === 0) {
    return number.toFixed(0)
  }
  return number
}

// https://www.w3.org/TR/WCAG22/#contrast-minimum
// https://www.w3.org/TR/WCAG22/#contrast-enhanced
// https://www.w3.org/TR/WCAG22/#non-text-contrast
function getPassFail(contrastRatio, criteria) {
  let status
  switch (criteria) {
    case "NormalAA":
      status = (contrastRatio >= 4.5) ? levels.pass : levels.fail;
      break;
    case "NormalAAA":
      status = (contrastRatio >= 7) ? levels.pass : levels.fail;
      break;
    case "LargeAA":
      status = (contrastRatio >= 3) ? levels.pass : levels.fail;
      break;
    case "LargeAAA":
      status = (contrastRatio >= 4.5) ? levels.pass : levels.fail;
      break;
    case "ObjectAA":
      status = (contrastRatio >= 3) ? levels.pass : levels.fail;
      break;
    default:
      status = levels.fail;
  }
  return status
}

function applyAlpha(src, bg, alphaPrc = 100) {
  let targetR, targetG, targetB
  let srcR, srcG, srcB, srcA
  let bgR, bgG, bgB

  src = src.substring(1)
  srcR = src.substring(0, 2)
  srcG = src.substring(2, 4)
  srcB = src.substring(4, 6)

  let alpha = Math.round(255 * alphaPrc / 100)
  srcA = Number(alpha).toString(16)
  
  srcR = parseInt(srcR, 16) / 255
  srcG = parseInt(srcG, 16) / 255
  srcB = parseInt(srcB, 16) / 255
  srcA = parseInt(srcA, 16) / 255
  
  bg = bg.substring(1)
  bgR = bg.substring(0, 2)
  bgG = bg.substring(2, 4)
  bgB = bg.substring(4, 6)

  bgR = parseInt(bgR, 16) / 255
  bgG = parseInt(bgG, 16) / 255
  bgB = parseInt(bgB, 16) / 255
  
  targetR = ((1 - srcA) * bgR)+ (srcA * srcR)

  targetR = targetR * 255
  targetR = Math.round(targetR)

  targetG = ((1 - srcA) * bgG) + (srcA * srcG)
  targetG = targetG * 255
  targetG = Math.round(targetG)
  
  targetB = ((1 - srcA) * bgB) + (srcA * srcB)
  targetB = targetB * 255
  targetB = Math.round(targetB)

  targetR = targetR.toString(16)
  targetG = targetG.toString(16)
  targetB = targetB.toString(16)

  let result = "#" + targetR + targetG + targetB
  result = result.toUpperCase()
  return result
}

function contrast (input) {
  // Merge defaults into user input
  input = Object.assign({}, DEFAULT_INPUT, input)
  input.appliedAlpha = applyAlpha(convertCssColorNameToHex(input.objectBackground), convertCssColorNameToHex(input.pageBackground), input.alphaChannel)

  let textContrastWithAlphaBackgroundContrastRatio = hexContrastCheck(
    convertCssColorNameToHex(input.textColour),
    convertCssColorNameToHex(input.appliedAlpha)
  )

  let textContrastWithAlphaBackground = {
    contrastRatio: roundNumber(textContrastWithAlphaBackgroundContrastRatio),
    normalAA: getPassFail(textContrastWithAlphaBackgroundContrastRatio, "NormalAA"),
    normalAAA: getPassFail(textContrastWithAlphaBackgroundContrastRatio, "NormalAAA"),
    largeAA: getPassFail(textContrastWithAlphaBackgroundContrastRatio, "LargeAA"),
    largeAAA: getPassFail(textContrastWithAlphaBackgroundContrastRatio, "LargeAAA")
  }
  
  let textContrastWithObjectContrastRatio = hexContrastCheck(
    convertCssColorNameToHex(input.textColour),
    convertCssColorNameToHex(input.objectBackground)
  )

  let textContrastWithObject = {
    contrastRatio: roundNumber(textContrastWithObjectContrastRatio),
    normalAA: getPassFail(textContrastWithObjectContrastRatio, "NormalAA"),
    normalAAA: getPassFail(textContrastWithObjectContrastRatio, "NormalAAA"),
    largeAA: getPassFail(textContrastWithObjectContrastRatio, "LargeAA"),
    largeAAA: getPassFail(textContrastWithObjectContrastRatio, "LargeAAA")
  }
  
  let objectContrastWithPageContrastRatio = hexContrastCheck(
    convertCssColorNameToHex(input.objectBackground),
    convertCssColorNameToHex(input.pageBackground)
  )

  let objectContrastWithPage = {
    contrastRatio: roundNumber(objectContrastWithPageContrastRatio),
    objectAA: getPassFail(objectContrastWithPageContrastRatio, "ObjectAA")
  }

  return {
    input,
    textContrastWithObject,
    objectContrastWithPage,
    textContrastWithAlphaBackground
  }  
}

module.exports = contrast