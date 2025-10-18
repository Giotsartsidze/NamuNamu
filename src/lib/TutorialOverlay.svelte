<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount, afterUpdate } from 'svelte';

	/** Prop: Function called when the user clicks "Start Cooking" or "Skip". */
	export let onFinish: () => void;

	/** NEW PROP: Function to tell the main app which mode to switch to. */
	export let onModeChange: (mode: 'recipe' | 'planner' | 'health' | 'calorie' | null) => void;

	const tutorialSteps = [
		{
			title: "Welcome to AI Namu Namu! 🧑‍🍳",
			text: "Your personal chef assistant. Let's show you how to start creating meals in seconds.",
			highlight: "",
			mode: null
		},
		{
			title: "Mode Selection",
			text: "Use these tabs to switch between the four main functions of the app.",
			highlight: ".tabs",
			mode: null
		},
		{
			title: "1. Single Recipe Mode 🍲",
			text: "Generate a quick recipe based on just a few ingredients and your basic dietary rules.",
			highlight: ".tabs .tab:nth-child(1)",
			mode: 'recipe'
		},
		{
			title: "2. 7-Day Meal Plan 🗓️",
			text: "Generate a complete weekly plan and shopping list, perfect for batch cooking and meal prep.",
			highlight: ".tabs .tab:nth-child(2)",
			mode: 'planner'
		},
		{
			title: "3. Health Analysis 🏋️",
			text: "Input your biometrics here to calculate your precise TDEE (daily calorie expenditure) and set weight goals.",
			highlight: ".tabs .tab:nth-child(3)",
			mode: 'health'
		},
		{
			title: "4. Calorie Analysis 📸",
			text: "Upload a picture of your food! The AI will estimate the ingredients and calorie count from the image.",
			highlight: ".tabs .tab:nth-child(4)",
			mode: 'calorie'
		},
		{
			title: "Input Your Data",
			text: "The form below changes based on your mode. Enter your data here and hit 'Generate'.",
			highlight: ".card",
			mode: 'recipe'
		},
		{
			title: "Save & Cook! ⭐",
			text: "Save your creations to Favorites or enter Cooking Mode for a hands-free kitchen experience.",
			highlight: ".view-saved",
			mode: 'recipe'
		}
	];

	let currentStepIndex: number = 0;
	let cardStyle: string = '';

	function nextStep() {
		if (currentStepIndex < tutorialSteps.length - 1) {
			currentStepIndex++;
			const nextMode = tutorialSteps[currentStepIndex].mode;
			if (nextMode) {
				onModeChange(nextMode);
			}
		} else {
			onFinish();
		}
	}

	function skipTutorial() {
		onModeChange('recipe');
		onFinish();
	}

	function recalculatePosition(step: number) {
		const selector = tutorialSteps[step].highlight;
		if (!selector) {
			cardStyle = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);';
			return;
		}

		setTimeout(() => {
			const target = document.querySelector(selector) as HTMLElement;
			const cardElement = document.querySelector('.tutorial-card') as HTMLElement;

			if (target && cardElement) {
				const rect = target.getBoundingClientRect();
				const windowWidth = window.innerWidth;
				const windowHeight = window.innerHeight;

				let topPos: number;
				let leftPos: number;

				if (selector.includes('.tabs') || selector.includes('.tab')) {
					// Position BELOW and CENTERED for tabs
					topPos = rect.bottom + 20;
					leftPos = rect.left + (rect.width / 2) - (cardElement.offsetWidth / 2);
				} else {
					// Default positioning (right or left)
					topPos = rect.top + (rect.height / 2) - (cardElement.offsetHeight / 2);
					leftPos = rect.right + 20;

					if (leftPos + cardElement.offsetWidth > windowWidth) {
						leftPos = rect.left - cardElement.offsetWidth - 20;

						if (leftPos < 10) {
							leftPos = windowWidth / 2 - cardElement.offsetWidth / 2;
						}
					}
				}

				// Ensure vertical position is within screen bounds
				if (topPos < 10) topPos = 10;
				if (topPos + cardElement.offsetHeight > windowHeight - 10) {
					topPos = windowHeight - cardElement.offsetHeight - 10;
				}

				// Ensure horizontal position is within screen bounds
				if (leftPos < 10) leftPos = 10;
				if (leftPos + cardElement.offsetWidth > windowWidth - 10) {
					leftPos = windowWidth - cardElement.offsetWidth - 10;
				}

				cardStyle = `position: absolute; top: ${topPos}px; left: ${leftPos}px; transform: none;`;

				if (rect.top < 0 || rect.bottom > windowHeight) {
					target.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}

			} else if (selector) {
				console.warn(`Tutorial target not found: ${selector}`);
				cardStyle = 'position: absolute; top: 20%; left: 50%; transform: translateX(-50%);';
			}
		}, 100);
	}

	onMount(() => {
		recalculatePosition(currentStepIndex);
		window.addEventListener('resize', () => recalculatePosition(currentStepIndex));
	});

	afterUpdate(() => {
		recalculatePosition(currentStepIndex);
	});
</script>

<div class="tutorial-overlay" transition:fade|local>
	<div class="tutorial-card" style={cardStyle}>
		<div class="step-indicator">Step {currentStepIndex + 1} of {tutorialSteps.length}</div>

		<h2>{tutorialSteps[currentStepIndex].title}</h2>
		<p>{tutorialSteps[currentStepIndex].text}</p>

		<div class="actions">
			<button on:click={skipTutorial} class="skip-btn">
				Skip Tutorial
			</button>

			<button on:click={nextStep} class="next-btn">
				{currentStepIndex === tutorialSteps.length - 1 ? 'Start Cooking! 🚀' : 'Next Step →'}
			</button>
		</div>
	</div>
</div>

<style>
    .tutorial-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(88, 104, 121, 0.3);
        /*backdrop-filter: blur(8px);*/
        z-index: 9999;
    }

    .tutorial-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(30px);
        padding: 35px 40px;
        border-radius: 20px;
        max-width: 400px;
        box-shadow:
                0 20px 60px rgba(88, 104, 121, 0.3),
                0 0 0 1px rgba(255, 255, 255, 0.6),
                0 0 0 4px rgba(146, 164, 172, 0.3);
        text-align: center;
        position: absolute;
        transition: top 0.3s ease-out, left 0.3s ease-out;
        border: 1px solid rgba(255, 255, 255, 0.8);
    }

    .step-indicator {
        color: #92a4ac;
        font-weight: 600;
        font-size: 12px;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 15px;
        opacity: 0.8;
    }

    .tutorial-card h2 {
        color: #586879;
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 15px 0;
        letter-spacing: 0.3px;
        line-height: 1.3;
    }

    .tutorial-card p {
        color: #7a8996;
        font-size: 15px;
        line-height: 1.7;
        margin-bottom: 30px;
        letter-spacing: 0.2px;
    }

    .actions {
        display: flex;
        gap: 12px;
    }

    .next-btn, .skip-btn {
        padding: 14px 24px;
        border-radius: 15px;
        font-weight: 600;
        font-size: 13px;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
    }

    .next-btn {
        background: linear-gradient(135deg, #586879 0%, #485566 100%);
        color: #f9fbfd;
        flex: 1;
        box-shadow: 0 4px 15px rgba(88, 104, 121, 0.3);
    }

    .next-btn:hover {
        background: linear-gradient(135deg, #485566 0%, #3a4453 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(88, 104, 121, 0.4);
    }

    .skip-btn {
        background: rgba(249, 251, 253, 0.8);
        border: 1px solid rgba(146, 164, 172, 0.3);
        color: #586879;
        backdrop-filter: blur(10px);
        padding: 14px 20px;
    }

    .skip-btn:hover {
        background: rgba(249, 251, 253, 1);
        transform: translateY(-2px);
    }

    @media (max-width: 768px) {
        .tutorial-card {
            max-width: calc(100% - 40px);
            padding: 28px 30px;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
        }

        .tutorial-card h2 {
            font-size: 20px;
        }

        .tutorial-card p {
            font-size: 14px;
        }

        .actions {
            flex-direction: column;
        }

        .next-btn, .skip-btn {
            width: 100%;
        }
    }
</style>