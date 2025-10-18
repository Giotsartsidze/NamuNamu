<script lang="ts">
	// Props passed from +page.svelte (using two-way binding)
	export let targetWeight: number | string;
	export let targetTimeframe: number | string;
	export let ingredients: string[];
	export let ingredientInput: string;
	export let errorMessage: string | null;

	export let handleGoalSubmission: () => Promise<void>;
	export let addIngredient: () => void;
	export let removeIngredient: (item: string) => void;
	export let handleKeyDown: (event: KeyboardEvent) => void;
</script>

	<div class="goal-card-wrapper">
		<h3 class="form-title">Achieve Your Goal</h3>
		<p class="goal-subtitle">To generate a calorie-precise 7-Day Plan, set your target below.</p>

		<form on:submit|preventDefault={handleGoalSubmission}>

			<div class="input-group">
				<label for="ingredients-input">Your Preferred Ingredients</label>

				<div class="tag-input-wrapper">
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
						placeholder="Add your favorite ingredients (e.g., chicken, tofu, avocado)..."
						bind:value={ingredientInput}
						on:keydown={handleKeyDown}
					/>
					<button on:click={addIngredient} type="button" class="add-tag-btn">
						+
					</button>
				</div>
				</div>
				<p class="planner-hint">Required for a usable plan. Your existing ingredients are loaded.</p>
			</div>

			<div class="input-group">
				<label for="target-weight">Target Weight (kg)</label>
				<input type="number" id="target-weight" bind:value={targetWeight} placeholder="e.g., 85" min="30" required>
			</div>

			<div class="input-group">
				<label for="timeframe">Timeframe (Weeks)</label>
				<input type="number" id="timeframe" bind:value={targetTimeframe} placeholder="e.g., 12" min="1" required>
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
        padding: 30px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        margin-top: 30px;
    }
    .form-title {
        color: #2c3e50;
        font-size: 1.3em;
        margin-bottom: 5px;
    }
    .goal-subtitle {
        font-size: 0.95em;
        color: #7f8c8d;
        margin-bottom: 20px;
    }
    .input-group { margin-bottom: 15px; }


    .subscribe-btn {
        background-color: #ffc107;
        color: white;
        padding: 12px 20px;
        font-size: 1.1em;
        font-weight: 700;
        border-radius: 6px;
        width: 100%;
        margin-top: 20px;
        transition: background-color 0.2s
        ease, transform 0.1s
        ease;
    }
    .subscribe-btn:hover {
        background-color: #e0a800;
    }
    .planner-hint {
        color: #7f8c8d;
        font-size: 0.9em;
        margin-top: 8px;
    }
    .error {
        color: #e74c3c;
        background: #fdf2f2;
        padding: 10px;
        border-radius: 6px;
        margin-top: 20px;
        border: 1px solid #fbdadada;
    }

    .input-group input[type="text"] {
        padding: 10px;
        height: 40px;
        border: 1px solid #dcdcdc;
        border-radius: 6px;
        width: 100%;
        box-sizing: border-box;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-group input[type="text"]:focus {
        border-color: #28a745;
        box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.04);
        outline: none;
    }

    .tag-container input[type="text"] {
        padding: 0;
        border: none;
        box-shadow: none;
    }
    .tag-input-wrapper {
        display: flex;
        align-items: stretch;
        border: 1px solid #dcdcdc;
        border-radius: 6px;
        overflow: hidden;
    }

    .tag-container {
        flex-grow: 1;
        padding: 8px;
        display: flex;
        /*flex-wrap: wrap;*/
        align-items: center;
        gap: 6px;
        min-height: 40px;
        border: none;
        box-shadow: none;
    }
    .tag-container input {
        padding: 0;
        flex-grow: 1;
        min-width: 100px;
        box-shadow: none;
        border: none;
        height: auto;
    }

    .add-tag-btn {
        width: 40px;
        height: auto;
        padding: 0;
        margin: 0;
        border: none;
        background-color: #007bff;
        color: white;
        font-size: 1.8em;
        border-radius: 0 6px 6px 0;
        cursor: pointer;
        transition: background-color 0.2s ease;
        line-height: 1;
    }
    .add-tag-btn:hover:not(:disabled) {
        background-color: #0056b3;
    }

    .tag {
        background-color: #e6f7ff;
        color: #007bff;
        padding: 6px 12px;
        border-radius: 25px;
        font-size: 0.85em;
    }
    .tag-remove {
        color: #007bff;
        font-weight: bold;
        padding: 0 0 0 5px;
        background: none;
        border: none;
        cursor: pointer;
    }
</style>