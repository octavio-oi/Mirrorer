const cardContainer = document.querySelector(".card-container")
const uploadText = document.querySelector(".upload-text")
const carousel = document.querySelector(".carousel")
const dropbox = document.querySelector(".dropbox")
const upload = document.querySelector(".upload")
const load = document.querySelector(".load")

const select = (() => ({
  min: 0, value: 0, max: 8, step: 1,
  left: function () {
    const { min, value, max, step } = this
    this.value = value === max ? min : value + step
  },
  right: function () {
    const { min, value, max, step } = this
    this.value = value === min ? max : value - step
  }
}))()

const createImage = attributes =>
  Object.assign(new Image(), attributes)

const insertImageContainer = imgs => {
  const documentFragment = new DocumentFragment()

  const templateImgs = imgs.map(img => {
    const button = document.createElement("input")
    const modal = document.createElement("div")
    const card = document.createElement("div")

    button.classList.add("card-button")
    modal.classList.add("card-modal")
    img.classList.add("card-img")
    card.classList.add("card")

    button.dataset.src = img.src
    button.dataset.alt = img.alt
    button.value = "Download"
    button.type = "button"

    card.append(img, modal)
    modal.appendChild(button)

    return card
  })

  documentFragment.append(...templateImgs)
  cardContainer.replaceChildren(documentFragment)

  cardContainer.children[0].classList.add("select")

  load.classList.add("hidden")
  dropbox.classList.add("minimize")
  carousel.classList.remove("hidden")
  uploadText.classList.remove("hidden")
}

const handleDownload = ({ target: element }) => {
  if (element.tagName !== "INPUT") { return }

  const a = document.createElement("a")

  a.download = element.dataset.alt
  a.href = element.dataset.src

  a.click()
}

const mirroedImage = (ctx, mode, image) => {
  if (mode === "normal") { return image.src }

  const commandAccepts = {
		"mirrorLeft": (i, w, h) => {
			ctx.drawImage(i, 0, 0, w/2, h, 0, 0, w/2, h)
			ctx.transform(-1, 0, 0, 1, w*1.5, 0)
			ctx.drawImage(i, 0, 0, w/2, h, w/2, 0, w/2, h)
		},
		"mirrorRight": (i, w, h) => {
			ctx.drawImage(i, w/2, 0, w/2, h, w/2, 0, w/2, h)
			ctx.transform(-1, 0, 0, 1, w/2, 0)
			ctx.drawImage(i, w/2, 0, w/2, h, 0, 0, w/2, h)
		},
		"mirrorTop": (i, w, h) => {
			ctx.drawImage(i, 0, 0, w, h/2, 0, 0, w, h/2)
			ctx.transform(1, 0, 0, -1, 0, h*1.5)
			ctx.drawImage(i, 0, 0, w, h/2, 0, h/2, w, h/2)
		},
		"mirrorBottom": (i, w, h) => {
			ctx.drawImage(i, 0, h/2, w, h/2, 0, h/2, w, h/2)
			ctx.transform(1, 0, 0, -1, 0, h/2)
			ctx.drawImage(i, 0, h/2, w, h/2, 0, 0, w, h/2)
		},
		"cardLeft": (i, w, h) => {
			ctx.drawImage(i, 0, 0, w/2, h, 0, 0, w/2, h)
			ctx.transform(-1, 0, 0, -1, w*1.5, h)
			ctx.drawImage(i, 0, 0, w/2, h, w/2, 0, w/2, h)
		},
		"cardRight": (i, w, h) => {
			ctx.drawImage(i, w/2, 0, w/2, h, w/2, 0, w/2, h)
			ctx.transform(-1, 0, 0, -1, w/2, h)
			ctx.drawImage(i, w/2, 0, w/2, h, 0, 0, w/2, h)
		},
		"cardTop": (i, w, h) => {
			ctx.drawImage(i, 0, 0, w, h/2, 0, 0, w, h/2)
			ctx.transform(-1, 0, 0, -1, w, h*1.5)
			ctx.drawImage(i, 0, 0, w, h/2, 0, h/2, w, h/2)
		},
		"cardBottom": (i, w, h) => {
			ctx.drawImage(i, 0, h/2, w, h/2, 0, h/2, w, h/2)
			ctx.transform(-1, 0, 0, -1, w, h/2)
			ctx.drawImage(i, 0, h/2, w, h/2, 0, 0, w, h/2)
		}
	}
  const { width, height } = image

	Object.assign(ctx.canvas, { width, height })
  ctx.clearRect(0, 0, width, height)
	commandAccepts[mode](image, width, height)

  return ctx.canvas.toDataURL(image.type, { quality: 1 })
}

const handleCanvas = ({ target: image }) => {
	const canvas = document.createElement("canvas")
	const ctx = canvas.getContext("2d")

  const modeList = [
    "normal",
    "mirrorLeft",
    "mirrorRight",
    "mirrorTop",
    "mirrorBottom",
    "cardLeft",
    "cardRight",
    "cardTop",
    "cardBottom",
  ]

  const imgs = modeList.map(mode => createImage({
    alt: mode, crossOrigin: "anonymuos",
    src: mirroedImage(ctx, mode, image)
  }))

  insertImageContainer(imgs)
}

const handleUpload = e => {
  const typeAccepts = ["image/png", "image/jpg", "image/jpeg"]
  const file = e.target.files[0]

  if (!typeAccepts.includes(file.type)) { return }

  createImage({
    onload: handleCanvas,
    crossOrigin: "anonymuos",
    src: URL.createObjectURL(file)
  })

  load.classList.remove("hidden")
  carousel.classList.add("hidden")
  uploadText.classList.add("hidden")
  dropbox.classList.remove("minimize")
}

const handleCarousel = ({ target: element }) => {
  if (element.tagName !== "IMG") { return }
  if (!element.dataset.roll) { return }

  cardContainer.children[select.value].classList.remove("select")
  select[element.dataset.roll]()
  cardContainer.children[select.value].classList.add("select")
}

upload.addEventListener("change", handleUpload)
carousel.addEventListener("click", handleCarousel)
cardContainer.addEventListener("click", handleDownload)
