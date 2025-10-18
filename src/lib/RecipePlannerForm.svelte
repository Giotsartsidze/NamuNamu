	<script lang="ts">
		export let ingredientInput: string;
		export let ingredients: string[];
		export let dietaryRestrictions: string;
		export let medicalConditions: string;
		export let isLoading: boolean;
		export let currentMode: 'recipe' | 'planner' | 'health';

		export let addIngredient: () => void;
		export let removeIngredient: (item: string) => void;
		export let handleKeyDown: (event: KeyboardEvent) => void;

		const MIN_INGREDIENTS = 5;
	</script>

	<div class="input-group">
		<label for="ingredients-input">Your Ingredients</label>

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
					placeholder="Type ingredient and press Enter..."
					bind:value={ingredientInput}
					on:keydown={handleKeyDown}
					disabled={isLoading}
				/>
			</div>

			<button on:click={addIngredient} type="button" class="add-tag-btn" disabled={isLoading}>
				+
			</button>
		</div>

		{#if currentMode === 'planner'}
			<p class="planner-hint">Plan requires **at least {MIN_INGREDIENTS}** ingredients.</p>
		{/if}
	</div>

	<div class="input-group">
		<label for="dietary">Dietary Needs (optional)</label>
		<input
			type="text"
			id="dietary"
			placeholder="e.g., vegetarian, low-carb, no dairy"
			bind:value={dietaryRestrictions}
			disabled={isLoading}
		/>
	</div>

	<div class="input-group">
		<label for="medical">Medical Conditions / Allergies (optional)</label>
		<input
			type="text"
			id="medical"
			placeholder="e.g., Diabetic, High Blood Pressure, Gluten Allergy"
			bind:value={medicalConditions}
			disabled={isLoading}
		/>
		<p class="hint">Note: Always consult a professional for medical advice.</p>
	</div>

	<style>
			label {
					font-weight: 500;
					font-size: 0.95em;
					color: #34495e;
					display: block;
					margin-bottom: 6px;
			}
			.input-group {
					margin-bottom: 20px;
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
					flex-wrap: wrap;
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

			.planner-hint, .hint {
					font-size: 0.85em;
					color: #7f8c8d;
					margin-top: 8px;
			}
			.hint {
					color: #c0392b;
					font-weight: 600;
					margin-top: 5px;
					padding-left: 5px;
			}
	</style>