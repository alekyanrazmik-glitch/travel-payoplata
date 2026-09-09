document.addEventListener("DOMContentLoaded", function () {
	const root = document.getElementById("root")

	if (window.FlightsSearchWidget && root) {
		// TODO: заменить demo-эндпоинт на боевой из личного кабинета Nemo/AeroTur.
		FlightsSearchWidget.init({
			webskyURL: "https://demo.websky.aero/gru",
			nemoURL: "https://travel.payoplata.ru",
			rootElement: root,
			locale: "ru",
		})
	}

	if (!root) return

	root.dataset.ppTrip = "oneway"

	function setTripMode(mode) {
		root.dataset.ppTrip = mode

		const activeComplexSwitch = root.querySelector(
			".widget__routeTypeSwitch_toOW span",
		)
		if (activeComplexSwitch && mode !== "complex") {
			activeComplexSwitch.click()
		}

		if (mode === "round") {
			const dateFields = root.querySelectorAll(".widget-dates__col")
			const returnInput = dateFields[1]?.querySelector(".widget-ui-input")
			if (returnInput) {
				returnInput.click()
			}
		}
	}

	function syncStartButtonLabel() {
		root.querySelectorAll(".widget__startButton.btn-primary").forEach(
			function (button) {
				if (button.textContent.trim() !== "Искать") {
					button.textContent = "Искать"
				}
			},
		)
	}

	function hideNoReturnButton() {
		root.querySelectorAll(
			"button, .widget-ui-datepicker__footer__button",
		).forEach(function (button) {
			const text = button.textContent.trim().toLowerCase()
			if (text.includes("обратный билет не нужен")) {
				button.style.display = "none"
			}
		})
	}

	function syncAirportPlaceholders() {
		root.querySelectorAll(".widget-airports__select").forEach(function (select) {
			const control = select.querySelector(".Select-control")
			const input = select.querySelector(".Select-input input")
			if (!control || !input) return

			const placeholderNode = select.querySelector(
				".Select-placeholder, .widget-airports__select__value__placeholder",
			)
			const placeholderText =
				input.getAttribute("placeholder") ||
				placeholderNode?.textContent.trim() ||
				control.dataset.ppPlaceholder ||
				"Введите город"
			const inputValue = input.value.trim()
			const hasSelectedValue =
				select.classList.contains("has-value") ||
				Boolean(
					select
						.querySelector(
							".Select-value-label, .widget-airports__select__value__airportName",
						)
						?.textContent.trim(),
				)
			const isSearching =
				select.classList.contains("is-focused") ||
				select.classList.contains("is-open")

			control.dataset.ppPlaceholder = placeholderText
			select.classList.toggle(
				"pp-airport-search-empty",
				isSearching && !inputValue && !hasSelectedValue,
			)
		})
	}

	function installTripSwitch() {
		const widget = root.querySelector(".widget")
		if (!widget) return

		root.dataset.ppComplex = widget.classList.contains("widget_CR")
			? "true"
			: "false"

		if (root.querySelector(".pp-flight-mode-switch")) {
			return
		}

		const switcher = document.createElement("div")
		switcher.className = "pp-flight-mode-switch"

		const round = document.createElement("button")
		round.type = "button"
		round.dataset.mode = "round"
		round.textContent = "В обе стороны"
		round.addEventListener("click", function () {
			setTripMode("round")
		})

		const oneWay = document.createElement("button")
		oneWay.type = "button"
		oneWay.dataset.mode = "oneway"
		oneWay.textContent = "В одну сторону"
		oneWay.addEventListener("click", function () {
			setTripMode("oneway")
		})

		switcher.append(oneWay, round)
		root.insertBefore(switcher, widget)
	}

	root.addEventListener(
		"click",
		function (event) {
			const closer = event.target.closest(
				".widget-dates__col:nth-child(2) .widget-ui-input__closer",
			)
			const widget = root.querySelector(".widget")
			if (closer && widget && !widget.classList.contains("widget_CR")) {
				window.setTimeout(function () {
					setTripMode("oneway")
				}, 0)
			}
		},
		true,
	)

	root.addEventListener("focusin", function () {
		window.requestAnimationFrame(syncAirportPlaceholders)
	})

	root.addEventListener("focusout", function () {
		window.requestAnimationFrame(syncAirportPlaceholders)
	})

	root.addEventListener("input", syncAirportPlaceholders)

	installTripSwitch()
	syncStartButtonLabel()
	hideNoReturnButton()
	syncAirportPlaceholders()

	new MutationObserver(function () {
		installTripSwitch()
		syncStartButtonLabel()
		hideNoReturnButton()
		syncAirportPlaceholders()
	}).observe(root, {
		attributes: true,
		attributeFilter: ["class", "placeholder", "value"],
		childList: true,
		subtree: true,
	})
})
