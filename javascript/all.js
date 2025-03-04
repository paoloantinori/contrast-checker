import contrast from './contrast.js';
import convertCssColorNameToHex from 'convert-css-color-name-to-hex';

const COLOUR_INPUT_SUFFIX = '-colour'

function debounce(func) {
  return function () {
    window.requestAnimationFrame(func)
  }
}

const $form = document.querySelector('form')

// If any inputs change, trigger a submit.
Array.from($form.elements).forEach($input => {
  // Hide submit button since we're handling this with AJAX.
  if ($input.type === 'submit') {
    return $input.setAttribute('hidden', true)
  }
  if ($input.type === 'reset') {
    $input.addEventListener('click', event => {
      event.preventDefault()
      resetColourInputs()
    })
    return
  }
  if ($input.name === 'alphaChannel') {
    return
  }
    
  appendColourInput($input)
  $input.addEventListener('change', debounce(submitForm))
  $input.addEventListener('input', debounce(submitForm))
})

// Client side simulation of a GET request.
$form.addEventListener('submit', async (event) => {
  event.preventDefault()
  submitForm()
});

async function submitForm () {
  const formData = new FormData($form)

  const queryString =
      Array.from(formData.entries())
            .map((entry) => `${encodeURIComponent(entry[0])}=${encodeURIComponent(entry[1])}`)
            .join('&')


  const updatedUrl = '?' + queryString
  window.history.replaceState('', '', updatedUrl)
  
  // Turn entries into an object
  let data = {}
  for(var entry of formData.entries()) {
     data[entry[0]] = entry[1]
  }
  const json = contrast(data)
  
  renderView(json)
}

function renderView (data) {
  const rootStyle = document.documentElement.style
  rootStyle.setProperty('--app-input-page-background', data.input.pageBackground)
  rootStyle.setProperty('--app-input-object-background', data.input.objectBackground)
  rootStyle.setProperty('--app-input-object-alpha-background', data.input.appliedAlpha)
  rootStyle.setProperty('--app-input-text-color', data.input.textColour)
  rootStyle.setProperty('--app-input-applied-alpha', data.input.appliedAlpha)
  rootStyle.setProperty('--app-input-alpha-channel', data.input.alphaChannel)

  rootStyle.setProperty('--app-object-contrast-with-page-color', data.objectContrastWithPage.objectAA.color)

  rootStyle.setProperty('--app-text-contrast-with-object-normal-aa-color', data.textContrastWithObject.normalAA.color)
  rootStyle.setProperty('--app-text-contrast-with-object-normal-aaa-color', data.textContrastWithObject.normalAAA.color)
  rootStyle.setProperty('--app-text-contrast-with-object-large-aa-color', data.textContrastWithObject.largeAA.color)
  rootStyle.setProperty('--app-text-contrast-with-object-large-aaa-color', data.textContrastWithObject.largeAAA.color)

  rootStyle.setProperty('--app-text-contrast-with-alpha-background-normal-aa-color', data.textContrastWithAlphaBackground.normalAA.color)
  rootStyle.setProperty('--app-text-contrast-with-alpha-background-normal-aaa-color', data.textContrastWithAlphaBackground.normalAAA.color)
  rootStyle.setProperty('--app-text-contrast-with-alpha-background-large-aa-color', data.textContrastWithAlphaBackground.largeAA.color)
  rootStyle.setProperty('--app-text-contrast-with-alpha-background-large-aaa-color', data.textContrastWithAlphaBackground.largeAAA.color)
  
  document.querySelector('[data-app-text-contrast-with-object-contrast-ratio]').textContent = data.textContrastWithObject.contrastRatio
  document.querySelector('[data-app-object-contrast-with-page-contrast-ratio]').textContent = data.objectContrastWithPage.contrastRatio
  document.querySelector('[data-app-text-contrast-with-alpha-background-contrast-ratio]').textContent = data.textContrastWithAlphaBackground.contrastRatio
  
  document.querySelector('[data-app-text-contrast-with-object-normal-aa]').textContent = data.textContrastWithObject.normalAA.title
  document.querySelector('[data-app-text-contrast-with-object-normal-aaa]').textContent = data.textContrastWithObject.normalAAA.title
  document.querySelector('[data-app-text-contrast-with-object-large-aa]').textContent = data.textContrastWithObject.largeAA.title
  document.querySelector('[data-app-text-contrast-with-object-large-aaa]').textContent = data.textContrastWithObject.largeAAA.title

  document.querySelector('[data-app-object-contrast-with-page-object-aa]').textContent = data.objectContrastWithPage.objectAA.title

  document.querySelector('[data-app-text-contrast-with-alpha-background-normal-aa]').textContent = data.textContrastWithAlphaBackground.normalAA.title
  document.querySelector('[data-app-text-contrast-with-alpha-background-normal-aaa]').textContent = data.textContrastWithAlphaBackground.normalAAA.title
  document.querySelector('[data-app-text-contrast-with-alpha-background-large-aa]').textContent = data.textContrastWithAlphaBackground.largeAA.title
  document.querySelector('[data-app-text-contrast-with-alpha-background-large-aaa]').textContent = data.textContrastWithAlphaBackground.largeAAA.title
  
  document.getElementById('appliedAlpha-colour').value = data.input.appliedAlpha
  document.getElementById('appliedAlpha').value = data.input.appliedAlpha
}

function resetColourInputs () {
  window.location.href = window.location.origin;
}

function appendColourInput ($input) {
  
  let $colourInput = document.createElement('input')
  $colourInput.className = 'js-app-input-color ' + $input.className + ' app-input-color'
  $colourInput.value = $input.value
  $colourInput.type = 'color'
  $colourInput.id = $input.id + COLOUR_INPUT_SUFFIX
  $colourInput.setAttribute('aria-label', `${$input.labels[0].textContent.trim()} Colour`)
  // Feature detection
  if ($colourInput.type === "color" && typeof $colourInput.selectionStart !== "number") {
    $colourInput.addEventListener('input', event => {

      console.log("__adding event listener to color input ")
      $input.value = $colourInput.value
      var event = new Event('input')
      $input.dispatchEvent(event)
    })
    $input.addEventListener('input', event => {

      console.log("__adding event listener to input")
      $colourInput.value = convertCssColorNameToHex($input.value)
    })
    $input.parentNode.appendChild($colourInput)
  }
  
}

// Populate initial render, TODO: Do this server side.
const queryString = new URLSearchParams(window.location.search);
const input = Object.fromEntries(queryString.entries());
const initialContrast = contrast(input);

Array.from($form.elements).forEach($input => {
    Object.keys(initialContrast.input).forEach(key => {
        if ($input.id.startsWith(key)) {
            if ($input.id.endsWith(COLOUR_INPUT_SUFFIX)) {
                $input.value = convertCssColorNameToHex(initialContrast.input[key]);
            } else {
                $input.value = initialContrast.input[key];
            }
        }
    })
});

renderView(initialContrast);