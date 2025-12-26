import './style.css'
import Core from './Nebula/Core.js'
import * as THREE from 'three'

// Title screen setup
const titleScreen = document.querySelector('.title-screen')
const hideTitle = () => {
    if(titleScreen) {
        setTimeout(() => titleScreen.classList.add('hidden'), 800)
    }
}

const core = new Core({
    targetElement: document.querySelector('.stage')
})

// Hide title when curtain (initial overlay) becomes visible
const observeOverlay = () => {
    const checkOverlay = setInterval(() => {
        const overlay = document.querySelector('.curtain')
        if(overlay && !overlay.classList.contains('hidden')) {
            hideTitle()
            clearInterval(checkOverlay)
        }
    }, 100)
    setTimeout(() => clearInterval(checkOverlay), 3000)
}

observeOverlay()

const getArtwork = () => core?.realm?.artwork

// Helper to apply source image
const loadSourceImage = () =>
{
    const art = getArtwork()
    if(art?.sourceImage)
    {
        art.applyTexture(art.sourceImage)
    }
}

// Overlay (initial choice)
const overlay = document.createElement('div')
overlay.className = 'curtain'

const overlayCard = document.createElement('div')
overlayCard.className = 'curtain-card'

const overlayTitle = document.createElement('h1')
overlayTitle.textContent = 'Choose your image'

const overlaySubtitle = document.createElement('p')
overlaySubtitle.textContent = 'Upload your own or use the default to get started.'

const overlayActions = document.createElement('div')
overlayActions.className = 'curtain-actions'

const overlayUploadLabel = document.createElement('label')
overlayUploadLabel.className = 'uploader primary'
overlayUploadLabel.textContent = 'Upload image'

const overlayUploadInput = document.createElement('input')
overlayUploadInput.type = 'file'
overlayUploadInput.accept = 'image/png,image/jpeg,image/jpg'
overlayUploadInput.addEventListener('change', (event) =>
{
    const file = event.target.files?.[0]
    if(file)
    {
        getArtwork()?.loadUserUploadedImage?.(file)
        hideOverlay()
        showFab()
    }
})
overlayUploadLabel.appendChild(overlayUploadInput)

const overlayDefaultBtn = document.createElement('button')
overlayDefaultBtn.className = 'outline-btn'
overlayDefaultBtn.textContent = 'Use default image'
overlayDefaultBtn.addEventListener('click', () =>
{
    loadSourceImage()
    hideOverlay()
    showFab()
})

overlayActions.appendChild(overlayUploadLabel)
overlayActions.appendChild(overlayDefaultBtn)
overlayCard.appendChild(overlayTitle)
overlayCard.appendChild(overlaySubtitle)
overlayCard.appendChild(overlayActions)
overlay.appendChild(overlayCard)
document.body.appendChild(overlay)

// Floating action menu (after selection)
const fab = document.createElement('button')
fab.className = 'bubble'
fab.innerHTML = '+'
fab.style.display = 'none'

const fabMenu = document.createElement('div')
fabMenu.className = 'bubble-menu'

const fabUploadLabel = document.createElement('label')
fabUploadLabel.className = 'uploader inline'
fabUploadLabel.textContent = 'Upload new'

const fabUploadInput = document.createElement('input')
fabUploadInput.type = 'file'
fabUploadInput.accept = 'image/png,image/jpeg,image/jpg'
fabUploadInput.addEventListener('change', (event) =>
{
    const file = event.target.files?.[0]
    if(file)
    {
        getArtwork()?.loadUserUploadedImage?.(file)
        closeFabMenu()
    }
})
fabUploadLabel.appendChild(fabUploadInput)

const fabDefaultBtn = document.createElement('button')
fabDefaultBtn.className = 'preset-btn'
fabDefaultBtn.textContent = 'Use default'
fabDefaultBtn.addEventListener('click', () =>
{
    loadSourceImage()
    closeFabMenu()
})

fabMenu.appendChild(fabUploadLabel)
fabMenu.appendChild(fabDefaultBtn)
document.body.appendChild(fabMenu)
document.body.appendChild(fab)

fab.addEventListener('click', () =>
{
    const isOpen = fabMenu.classList.contains('open')
    if(isOpen)
    {
        closeFabMenu()
    }
    else
    {
        openFabMenu()
    }
})

function openFabMenu()
{
    fabMenu.classList.add('open')
}

function closeFabMenu()
{
    fabMenu.classList.remove('open')
}

function showFab()
{
    fab.style.display = 'flex'
}

function hideOverlay()
{
    overlay.classList.add('hidden')
}

// Reset button at bottom center
const resetButton = document.createElement('button')
resetButton.className = 'reseed-btn'
resetButton.textContent = 'Reset'
resetButton.addEventListener('click', () =>
{
    getArtwork()?.resetParticles?.()
})

document.body.appendChild(resetButton)

// Settings menu in top right
const settingsButton = document.createElement('button')
settingsButton.className = 'gear-btn'
settingsButton.innerHTML = '⚙'
settingsButton.title = 'Settings'

const settingsPanel = document.createElement('div')
settingsPanel.className = 'gear-panel'

const settingsTitle = document.createElement('h2')
settingsTitle.textContent = 'Settings'

const settingsContent = document.createElement('div')
settingsContent.className = 'gear-content'

// Particle Size slider
const sizeLabel = document.createElement('label')
sizeLabel.className = 'dial-label'
sizeLabel.textContent = 'Particle Size'

const sizeSlider = document.createElement('input')
sizeSlider.type = 'range'
sizeSlider.className = 'dial'
sizeSlider.min = '10'
sizeSlider.max = '150'
sizeSlider.value = '50'
sizeSlider.addEventListener('input', (e) => {
    const art = getArtwork()
    if(art?.particleMaterial)
    {
        art.particleMaterial.uniforms.uSize.value = parseFloat(e.target.value) * core.profile.pixelRatio
    }
})

// Mouse Repulsion Radius
const radiusLabel = document.createElement('label')
radiusLabel.className = 'dial-label'
radiusLabel.textContent = 'Repulsion Radius'

const radiusSlider = document.createElement('input')
radiusSlider.type = 'range'
radiusSlider.className = 'dial'
radiusSlider.min = '0.01'
radiusSlider.max = '1'
radiusSlider.step = '0.01'
radiusSlider.value = '0.15'
radiusSlider.addEventListener('input', (e) => {
    const art = getArtwork()
    if(art?.fluxMap?.plane?.material)
    {
        art.fluxMap.plane.material.uniforms.uMouseRadius.value = parseFloat(e.target.value)
    }
})

// Mouse Repulsion Strength
const strengthLabel = document.createElement('label')
strengthLabel.className = 'dial-label'
strengthLabel.textContent = 'Repulsion Strength'

const strengthSlider = document.createElement('input')
strengthSlider.type = 'range'
strengthSlider.className = 'dial'
strengthSlider.min = '0'
strengthSlider.max = '2'
strengthSlider.step = '0.01'
strengthSlider.value = '0.28'
strengthSlider.addEventListener('input', (e) => {
    const art = getArtwork()
    if(art?.fluxMap?.plane?.material)
    {
        art.fluxMap.plane.material.uniforms.uMouseStrength.value = parseFloat(e.target.value)
    }
})

// Decay Speed
const decayLabel = document.createElement('label')
decayLabel.className = 'dial-label'
decayLabel.textContent = 'Decay Speed'

const decaySlider = document.createElement('input')
decaySlider.type = 'range'
decaySlider.className = 'dial'
decaySlider.min = '0.00001'
decaySlider.max = '0.005'
decaySlider.step = '0.00001'
decaySlider.value = '0.00049'
decaySlider.addEventListener('input', (e) => {
    const art = getArtwork()
    if(art?.fluxMap?.plane?.material)
    {
        art.fluxMap.plane.material.uniforms.uDecaySpeed.value = parseFloat(e.target.value)
    }
})

const resetDefaultsBtn = document.createElement('button')
resetDefaultsBtn.className = 'defaults-btn'
resetDefaultsBtn.textContent = 'Reset to Defaults'
resetDefaultsBtn.addEventListener('click', () => {
    sizeSlider.value = '50'
    radiusSlider.value = '0.15'
    strengthSlider.value = '0.28'
    decaySlider.value = '0.00049'

    const art = getArtwork()
    if(art?.particleMaterial && art?.fluxMap?.plane?.material)
    {
        art.particleMaterial.uniforms.uSize.value = 50 * core.profile.pixelRatio
        art.fluxMap.plane.material.uniforms.uMouseRadius.value = 0.15
        art.fluxMap.plane.material.uniforms.uMouseStrength.value = 0.28
        art.fluxMap.plane.material.uniforms.uDecaySpeed.value = 0.00049
    }
})

settingsContent.appendChild(sizeLabel)
settingsContent.appendChild(sizeSlider)
settingsContent.appendChild(radiusLabel)
settingsContent.appendChild(radiusSlider)
settingsContent.appendChild(strengthLabel)
settingsContent.appendChild(strengthSlider)
settingsContent.appendChild(decayLabel)
settingsContent.appendChild(decaySlider)
settingsContent.appendChild(resetDefaultsBtn)

settingsPanel.appendChild(settingsTitle)
settingsPanel.appendChild(settingsContent)

settingsButton.addEventListener('click', () => {
    settingsPanel.classList.toggle('open')
})

document.body.appendChild(settingsButton)
document.body.appendChild(settingsPanel)
