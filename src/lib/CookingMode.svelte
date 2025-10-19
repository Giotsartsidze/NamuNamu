<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	export let markdownContent: string;

	let recipeTitle: string = 'Generated Recipe';
	let steps: string[] = [];
	let currentStepIndex: number = 0;
	let ttsSupport: boolean = false;
	let isReading: boolean = false;
	let speechSynth: SpeechSynthesis | null = null;
	let utterance: SpeechSynthesisUtterance | null = null;

	onMount(() => {
		if ('speechSynthesis' in window) {
			ttsSupport = true;
			speechSynth = window.speechSynthesis;
		}

		const titleMatch = markdownContent.match(/#+\s*Recipe Title:\s*(.*)/i);
		recipeTitle = titleMatch ? titleMatch[1].trim() : 'AI Generated Recipe';

		const instructionsHeadingRegex = /#+\s*(Instructions|Method|Steps)[^#\n]*(.*?)(?=\n#+|$)/is;
		const stepsMatch = markdownContent.match(instructionsHeadingRegex);
		let rawSteps = stepsMatch && stepsMatch[2] ? stepsMatch[2].trim() : '';

		if (!rawSteps) {
			steps = ["Could not find an 'Instructions' or 'Steps' section in the recipe."];
			return;
		}

		steps = rawSteps
			.split(/(\n\s*\d+\.\s*)|(\n\s*\*\*?\d+\*\*?\.\s*)/)
			.filter(segment => segment && segment.trim())
			.map(segment => segment.trim().replace(/^(\d+\.\s*|\*\*?\d+\*\*?\.\s*)/, ''))
			.filter(segment => segment.length > 5);
		if (steps.length === 0) {
			steps = ["The instructions section was found but no distinct, numbered cooking steps could be parsed. Showing raw text: \n\n" + rawSteps];
		}
	});

	function nextStep() {
		if (currentStepIndex < steps.length - 1) {
			currentStepIndex++;
			stopReading();
		}
	}

	function prevStep() {
		if (currentStepIndex > 0) {
			currentStepIndex--;
			stopReading();
		}
	}

	function toggleReading() {
		if (!ttsSupport || !speechSynth) return;

		if (isReading) {
			stopReading();
		} else {
			startReading();
		}
	}

	function startReading() {
		if (!ttsSupport || !speechSynth) return;

		stopReading();

		const currentStepText = steps[currentStepIndex];
		utterance = new SpeechSynthesisUtterance(currentStepText);
		utterance.voice = speechSynth.getVoices().find(v => v.lang.includes('en')) || null;

		utterance.onend = () => {
			isReading = false;
			if (currentStepIndex < steps.length - 1) {
				nextStep();
			}
		};

		speechSynth.speak(utterance);
		isReading = true;
	}

	function stopReading() {
		if (speechSynth && speechSynth.speaking) {
			speechSynth.cancel();
			isReading = false;
		}
	}
</script>

<div class="cooking-mode-container">
	<div class="header">
		<h1 class="mode-title">Cooking Mode</h1>
		<p class="recipe-name">{recipeTitle}</p>
		<div class="step-counter">
			Step {currentStepIndex + 1} of {steps.length}
		</div>
	</div>

	<div class="step-display-area">
		{#key currentStepIndex}
			<p class="current-step-text" transition:slide>
				{@html steps[currentStepIndex]}
			</p>
		{/key}
	</div>

	<div class="controls">
		<button on:click={prevStep} disabled={currentStepIndex === 0} class="nav-btn prev-btn">
			Previous Step
		</button>

		{#if ttsSupport}
			<button on:click={toggleReading} class="tts-btn" class:reading={isReading}>
				<span class="icon">{isReading ? '🛑' : '🔊'}</span>
				{isReading ? 'Stop Reading' : 'Read Step'}
			</button>
		{/if}

		<button on:click={nextStep} disabled={currentStepIndex === steps.length - 1} class="nav-btn next-btn">
			Next Step
		</button>
	</div>
</div>

<style>
    .cooking-mode-container {
        /*color: white;*/
        min-height: 500px;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: center;
				background: linear-gradient(135deg, #c6dddb 0%, #92a4ac 40%, #f9fbfd 100%);
    }
    .header {
        margin-bottom: 20px;
    }
    .mode-title {
        font-size: 2.5em;
        font-weight: 900;
        color: var(--primary-gold);
        margin: 0;
    }
    .recipe-name {
        font-size: 1.2em;
        margin-top: 5px;
        /*color: rgba(255, 255, 255, 0.8);*/
    }
    .step-counter {
        margin-top: 15px;
        font-size: 1.1em;
        font-weight: 600;
        padding: 5px 10px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
        display: inline-block;
    }
    .step-display-area {
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 30px 0;
        min-height: 150px;
    }
    .current-step-text {
        font-size: 1.8em;
        line-height: 1.5;
        font-weight: 300; /* Light font for readability */
        max-width: 80%;
        margin: 0 auto;
    }
    .controls {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 30px;
    }
    .nav-btn, .tts-btn {
        padding: 15px 25px;
        font-size: 1.1em;
        font-weight: 700;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .nav-btn.prev-btn {
        background: linear-gradient(135deg, #586879 0%, #485566 100%);
        color: #bdc3c7;
    }
    .nav-btn.next-btn {
        background: linear-gradient(135deg, #586879 0%, #485566 100%);
        color: #bdc3c7;
    }
    .nav-btn:disabled {
        background-color: #242e36;
        color: #bdc3c7;
        cursor: not-allowed;
    }
    .tts-btn {
       	background:  linear-gradient(135deg, #2179d9 0%, #1d293b 100%);
        color: white;
    }
    .tts-btn.reading {
        background-color: var(--accent-crimson);
    }
</style>