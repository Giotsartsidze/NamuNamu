<script lang="ts">
	import { darkMode } from '../stores/darkModeStore';

	export let targetWeight: number | string;
	export let targetTimeframe: number | string;
	export let ingredients: string[];
	export let ingredientInput: string;
	export let errorMessage: string | null;
	export let showGoalForm: boolean; // Add to handle conditional error display

	export let handleGoalSubmission: () => Promise<void>;
	export let addIngredient: () => void;
	export let removeIngredient: (item: string) => void;
	export let handleKeyDown: (event: KeyboardEvent) => void;
</script>

<div class="goal-card-wrapper" class:dark={$darkMode}>
	<h3 class="form-title">Achieve Your Goal</h3>
	<p class="goal-subtitle">
		Based on your analysis, set your target below to generate a **calorie-precise 7-Day Plan**.
	</p>

	<form on:submit|preventDefault={handleGoalSubmission}>

		<div class="input-group">
			<label for="ingredients-input">Your Preferred Ingredients</label>

			<div class="ingredients-container">
				<div class="tag-container">
					{#each ingredients as ingredient}
						<div class="tag">
							{ingredient}
							<button class="tag-remove" on:click={() => removeIngredient(ingredient)} type="button">
								&times;
							</button>
						</div>
					{/each}

					<input
						type="text"
						id="ingredients-input"
						placeholder="Type ingredient and press Enter..."
						bind:value={ingredientInput}
						on:keydown={handleKeyDown}
					/>
				</div>

				<button on:click={addIngredient} type="button" class="add-btn">
					+
				</button>
			</div>
			<p class="planner-hint">Required for a usable plan. Your existing ingredients are loaded.</p>
		</div>

		<div class="input-group split-group">
			<div class="split-item">
				<label for="target-weight">Target Weight (kg)</label>
				<input type="number" id="target-weight" bind:value={targetWeight} placeholder="e.g., 85" min="30" required>
			</div>

			<div class="split-item">
				<label for="timeframe">Timeframe (Weeks)</label>
				<input type="number" id="timeframe" bind:value={targetTimeframe} placeholder="e.g., 12" min="1" required>
			</div>
		</div>

		<button type="submit" class="submit-btn subscribe-btn">
			Subscribe & Generate Plan (0.1 GEL)
		</button>
	</form>

	{#if errorMessage && showGoalForm}
		<p class="error">{errorMessage}</p>
	{/if}
</div>

<style>
    .goal-card-wrapper {
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.6);
    }

    .goal-card-wrapper.dark {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .form-title {
        color: #586879;
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 10px;
        transition: color 0.3s ease;
    }
    .goal-card-wrapper.dark .form-title {
        color: #D4D4E0;
    }

    .goal-subtitle {
        font-size: 14px;
        color: #7a8996;
        margin-bottom: 30px;
        line-height: 1.6;
        transition: color 0.3s ease;
    }
    .goal-card-wrapper.dark .goal-subtitle {
        color: #9898A8;
    }

    .input-group { margin-bottom: 25px; }

    .split-group {
        display: flex;
        gap: 20px;
    }
    .split-item {
        flex: 1;
    }

    label {
        display: block;
        color: #586879;
        font-size: 12px;
        margin-bottom: 8px;
        font-weight: 600;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        transition: color 0.3s ease;
    }
    .goal-card-wrapper.dark label {
        color: #D4D4E0;
    }

    input[type="number"] {
        width: 100%;
        padding: 16px 22px;
        border: 1px solid rgba(146, 164, 172, 0.3);
        border-radius: 15px;
        font-size: 14px;
        color: #586879;
        background: rgba(255, 255, 255, 0.9);
        transition: all 0.3s ease;
        box-sizing: border-box;
    }
    .goal-card-wrapper.dark input[type="number"] {
        border-color: rgba(255, 255, 255, 0.15);
        color: #E8E8F0;
        background: rgba(255, 255, 255, 0.08);
    }

    input[type="number"]:focus {
        outline: none;
        border-color: #92a4ac;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(146, 164, 172, 0.12);
    }

    .goal-card-wrapper.dark input[type="number"]:focus {
        border-color: #5A5A6D;
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 0 0 3px rgba(90, 90, 109, 0.2);
    }



    .ingredients-container {
        display: flex;
        gap: 12px;
    }

    .tag-container {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        padding: 10px 15px;

        /* Input field styling applied here */
        border: 1px solid rgba(146, 164, 172, 0.3);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.9);
        transition: all 0.3s ease;
    }

    .goal-card-wrapper.dark .tag-container {
        border-color: rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.08);
    }

    .tag-container input[type="text"] {
        flex-grow: 1;
        min-width: 100px;
        padding: 5px 0;
        border: none;
        box-shadow: none;
        font-size: 14px;
        color: #586879;
        background: transparent;
    }

    .goal-card-wrapper.dark .tag-container input[type="text"] {
        color: #E8E8F0;
    }

    .tag-container:focus-within {
        border-color: #92a4ac;
        box-shadow: 0 0 0 3px rgba(146, 164, 172, 0.12);
    }

    .goal-card-wrapper.dark .tag-container:focus-within {
        border-color: #5A5A6D;
        box-shadow: 0 0 0 3px rgba(90, 90, 109, 0.2);
    }

    .add-btn {
        background: linear-gradient(135deg, #586879 0%, #485566 100%);
        color: white;
        border: none;
        width: 52px;
        height: 52px;
        border-radius: 15px;
        font-size: 22px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(88, 104, 121, 0.25);
        flex-shrink: 0;
    }

    .add-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #485566 0%, #3a4453 100%);
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(88, 104, 121, 0.35);
    }

    .goal-card-wrapper.dark .add-btn {
        background: #5A5A6D;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .goal-card-wrapper.dark .add-btn:hover:not(:disabled) {
        background: #4A4A5D;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transform: scale(1.05);
    }

    .tag {
        background: linear-gradient(135deg, #c6dddb 0%, #b3ccc9 100%);
        color: #586879;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
        display: flex;
        align-items: center;
        font-weight: 500;
        letter-spacing: 0.3px;
        flex-shrink: 0;
    }
    .goal-card-wrapper.dark .tag {
        background: rgba(255, 255, 255, 0.12);
        color: #E8E8F0;
        border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .tag-remove {
        color: #586879;
        font-weight: bold;
        padding: 0 0 0 5px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    .tag-remove:hover {
        opacity: 1;
    }
    .goal-card-wrapper.dark .tag-remove {
        color: #E8E8F0;
    }


    /* --- Subscription Button --- */
    .subscribe-btn {
        width: 100%;
        background: linear-gradient(135deg, #f1c40f 0%, #e67e22 100%);
        color: #2c3e50;
        border: none;
        padding: 18px;
        border-radius: 15px;
        font-size: 13px;
        cursor: pointer;
        margin-top: 32px;
        transition: all 0.3s ease;
        font-weight: 600;
        letter-spacing: 1.5px;
        box-shadow: 0 6px 25px rgba(241, 196, 15, 0.3);
        text-transform: uppercase;
    }
    .subscribe-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
        transform: translateY(-2px);
        box-shadow: 0 10px 35px rgba(241, 196, 15, 0.4);
    }

    .planner-hint {
        color: #a5b5be;
        font-size: 12px;
        margin-top: 8px;
        letter-spacing: 0.2px;
        transition: color 0.3s ease;
    }
    .goal-card-wrapper.dark .planner-hint {
        color: #787888;
    }

    .error {
        background: rgba(231, 76, 60, 0.1);
        color: #c0392b;
        padding: 12px;
        border-radius: 8px;
        margin-top: 25px;
        font-size: 14px;
        border: 1px solid rgba(231, 76, 60, 0.3);
    }

    /* Responsive Adjustments */
    @media (max-width: 600px) {
        .split-group {
            flex-direction: column;
            gap: 15px;
        }
        .ingredients-container {
            flex-direction: column;
            gap: 15px;
        }
        .tag-container {
            width: 100%;
            min-height: 52px;
        }
        .add-btn {
            width: 100%;
            height: 52px;
            border-radius: 15px; /* Full button is rounded */
        }
    }
</style>
