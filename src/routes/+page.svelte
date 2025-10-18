<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { addFavorite, favoriteRecipes } from '../stores/favoritesStore';
	import { darkMode, toggleDarkMode } from '../stores/darkModeStore';
	import FavoriteList from '$lib/FavoriteList.svelte';
	import MarkdownRenderer from '$lib/MarkdownRenderer.svelte';
	import RecipePlannerForm from '$lib/RecipePlannerForm.svelte';
	import BiometricForm from '$lib/BiometricForm.svelte';
	import GoalSettingForm from '$lib/GoalSettingForm.svelte';
	import CookingMode from '$lib/CookingMode.svelte';
	import { user } from '../stores/authStore';
	import { logout } from '$lib/firebase/auth';
	import type { User } from 'firebase/auth';
	import { onMount } from 'svelte';
	import TutorialOverlay from '$lib/TutorialOverlay.svelte';

	// --- Core State ---
	let ingredientInput: string = '';
	let ingredients: string[] = [];
	let dietaryRestrictions: string = '';
	let medicalConditions: string = '';
	let isLoading: boolean = false;
	let errorMessage: string | null = null;
	let showFavorites: boolean = false;
	let currentMode: 'recipe' | 'planner' | 'health' | 'calorie' = 'recipe';
	let hasGenerated: boolean = false;
	let isCookingMode: boolean = false;

	let currentUser: User | null | undefined;

	let showTutorial: boolean = false;
	const TUTORIAL_KEY = 'namu_tutorial_seen';

	user.subscribe(value => {
		currentUser = value;
	});

	// --- Health/Biometric State ---
	let gender: 'male' | 'female' | '' = '';
	let age: number | string = '';
	let weight: number | string = '';
	let height: number | string = '';
	let activityLevel: 'Sedentary' | 'Moderate' | 'Active' | '' = '';
	let targetWeight: number | string = '';
	let targetTimeframe: number | string = '';
	let showGoalForm: boolean = false;
	let isSubscribed: boolean = false;

	// --- Image Analysis State ---
	let imageFile: File | null = null;
	let imageBase64: string | null = null;
	let imageMimeType: string | null = null;

	// --- Scheduling State ---
	let showCalendarForm: boolean = false;
	let scheduleDate: string = new Date().toISOString().substring(0, 10);
	let scheduleTime: string = '19:00';

	const MIN_INGREDIENTS = 5;

	// --- Content Stores ---
	const tdeeContent: Writable<string> = writable('');
	const planContent: Writable<string> = writable('');
	const recipeContent: Writable<string> = writable('');
	const goalPlanContent: Writable<string> = writable('');
	const calorieContent: Writable<string> = writable('');

	onMount(() => {
		if (typeof window !== 'undefined' && !localStorage.getItem(TUTORIAL_KEY)) {
			showTutorial = true;
		}
	});

	function handleTutorialFinish() {
		showTutorial = false;
		if (typeof window !== 'undefined') {
			localStorage.setItem(TUTORIAL_KEY, 'true');
		}
	}

	function handleModeChange(mode: 'recipe' | 'planner' | 'health' | 'calorie' | null) {
		if (mode) {
			resetModes();
			currentMode = mode;
		}
	}

	function startTutorialAgain() {
		showTutorial = true;
	}

	function resetModes() {
		isCookingMode = false;
		showFavorites = false;
	}

	async function generateContent() {
		hasGenerated = true;
		errorMessage = null;

		if (currentMode === 'recipe') { await generateRecipe(); }
		else if (currentMode === 'planner') { await generatePlan(); }
		else if (currentMode === 'health') { await runHealthAnalysis(); }
		else if (currentMode === 'calorie') { await runCalorieAnalysis(); }
	}

	async function runCalorieAnalysis() {
		calorieContent.set('');
		isLoading = true;

		if (!imageBase64 || !imageMimeType) {
			errorMessage = 'Please upload a food image to analyze.';
			isLoading = false;
			return;
		}

		try {
			const response = await fetch('/api/analyze-image', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ imageBase64, imageMimeType }),
			});

			if (!response.ok || !response.body) {
				const errorText = await response.text();
				throw new Error(`API call failed: ${response.status} - ${errorText}`);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				calorieContent.update(current => current + decoder.decode(value, { stream: true }));
			}
		} catch (error) {
			console.error(error);
			errorMessage = 'Failed to analyze the image for calories.';
			calorieContent.set('Oops! Could not generate the calorie analysis.');
		} finally {
			isLoading = false;
		}
	}

	function handleImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			imageFile = input.files[0];
			imageMimeType = imageFile.type;

			const reader = new FileReader();
			reader.onload = (e) => {
				const base64String = (e.target?.result as string).split(',')[1];
				imageBase64 = base64String;
			};
			reader.readAsDataURL(imageFile);
		} else {
			imageFile = null;
			imageBase64 = null;
			imageMimeType = null;
		}
	}

	async function runHealthAnalysis() {
		tdeeContent.set('');
		isLoading = true;

		if (!gender || !age || !weight || !height || !activityLevel) {
			errorMessage = 'Please fill out all biometric fields (Gender, Age, Weight, Height, Activity).';
			isLoading = false;
			return;
		}

		try {
			const response = await fetch('/api/analyze-health', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					gender,
					age: Number(age),
					weight: Number(weight),
					height: Number(height),
					activityLevel
				}),
			});

			if (!response.ok || !response.body) {
				const errorText = await response.text();
				throw new Error(`API call failed: ${response.status} - ${errorText}`);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				tdeeContent.update(current => current + decoder.decode(value, { stream: true }));
			}
		} catch (error) {
			console.error(error);
			errorMessage = 'Failed to analyze health profile.';
			tdeeContent.set('Oops! Could not generate the analysis.');
		} finally {
			isLoading = false;
			if (!errorMessage) {
				showGoalForm = true;
			}
		}
	}

	async function handleGoalSubmission() {
		errorMessage = null;

		if (Number(targetWeight) <= 0 || Number(targetTimeframe) <= 0) {
			errorMessage = 'Please enter valid positive numbers for your goal.';
			return;
		}
		if (ingredients.length === 0) {
			errorMessage = 'Please add at least one ingredient to generate a personalized plan!';
			return;
		}

		await new Promise(resolve => setTimeout(resolve, 500));

		isSubscribed = true;
		showGoalForm = false;

		alert("Payment Successful! Generating your personalized plan now...");

		hasGenerated = true;
		await generateFinalCaloriePlan();
	}

	async function generateFinalCaloriePlan() {
		goalPlanContent.set('');
		isLoading = true;

		try {
			const response = await fetch('/api/generate-plan', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ingredients: ingredients,
					dietaryRestrictions: dietaryRestrictions,
					medicalConditions: medicalConditions,
					targetWeight: targetWeight,
					targetTimeframe: targetTimeframe,
				}),
			});

			if (!response.ok || !response.body) {
				const errorText = await response.text();
				throw new Error(`Goal Plan API call failed: ${response.status} - ${errorText}`);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				goalPlanContent.update(current => current + decoder.decode(value, { stream: true }));
			}

		} catch (error) {
			console.error(error);
			errorMessage = 'Failed to generate personalized calorie plan.';
			goalPlanContent.set('Oops! Could not generate the plan after subscription.');
		} finally {
			isLoading = false;
		}
	}

	async function generatePlan() {
		planContent.set('');
		isLoading = true;

		if (ingredients.length < MIN_INGREDIENTS) {
			errorMessage = `Please add at least ${MIN_INGREDIENTS} ingredients to generate a full 7-day plan.`;
			isLoading = false;
			return;
		}

		try {
			const response = await fetch('/api/generate-plan', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ingredients: ingredients,
					dietaryRestrictions: dietaryRestrictions,
					medicalConditions: medicalConditions,
				}),
			});

			if (!response.ok || !response.body) {
				const errorText = await response.text();
				throw new Error(`API call failed: ${response.status} - ${errorText}`);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				planContent.update(current => current + decoder.decode(value, { stream: true }));
			}
		} catch (error) {
			console.error(error);
			errorMessage = 'An error occurred while generating the plan.';
		} finally {
			isLoading = false;
		}
	}

	async function generateRecipe() {
		recipeContent.set('');
		isLoading = true;

		if (ingredients.length === 0) {
			errorMessage = 'Please add at least one ingredient tag.';
			isLoading = false;
			return;
		}
		try {
			const response = await fetch('/api/generate-recipe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ingredients: ingredients,
					dietaryRestrictions: dietaryRestrictions,
					medicalConditions: medicalConditions,
				}),
			});

			if (!response.ok || !response.body) {
				const errorText = await response.text();
				throw new Error(`API call failed: ${response.status} - ${errorText}`);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				recipeContent.update(current => current + decoder.decode(value, { stream: true }));
			}
		} catch (error) {
			console.error(error);
			errorMessage = 'An error occurred while generating the recipe.';
			recipeContent.set('Oops! Could not generate the recipe.');
		} finally {
			isLoading = false;
		}
	}

	function addIngredient() {
		const trimmedInput = ingredientInput.trim();
		if (trimmedInput && !ingredients.includes(trimmedInput)) {
			ingredients = [...ingredients, trimmedInput];
			ingredientInput = '';
		}
	}

	function removeIngredient(item: string) {
		ingredients = ingredients.filter(i => i !== item);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === 'Tab') {
			event.preventDefault();
			addIngredient();
		}
	}

	function saveCurrentRecipe() {
		addFavorite($recipeContent);
		alert('Recipe saved to favorites!');
	}

	function saveCurrentPlan() {
		if (!$planContent) return;
		const planTitle = `7-Day Meal Plan (${new Date().toLocaleDateString()})`;
		const planContentToSave = `# ${planTitle}\n---\n${$planContent}\n`;

		addFavorite(planContentToSave);
		alert('Meal Plan saved to your favorites!');
	}

	function printPlan() {
		window.print();
	}

	function addToCalendar(recipeTitle: string, dateStr: string, timeStr: string) {
		const scheduleDateTime = new Date(`${dateStr}T${timeStr}:00`);

		if (scheduleDateTime <= new Date()) {
			alert('Please select a date and time in the future.');
			return;
		}

		const future = new Date(scheduleDateTime.getTime() + 60 * 60 * 1000);
		const formatTime = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

		const calendarContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RecipeAssistant//EN
BEGIN:VEVENT
UID:${Date.now()}@recipeassistant.com
DTSTAMP:${formatTime(new Date())}
DTSTART:${formatTime(scheduleDateTime)}
DTEND:${formatTime(future)}
SUMMARY:Cook ${recipeTitle}
DESCRIPTION:Time to start cooking! Recipe: ${recipeTitle}
END:VEVENT
END:VCALENDAR`;

		const blob = new Blob([calendarContent], { type: 'text/calendar;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `Cook_${recipeTitle.replace(/\s/g, '_')}.ics`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		alert(`Successfully scheduled "${recipeTitle}" for ${dateStr} at ${timeStr}!`);
		showCalendarForm = false;
	}
</script>

<div class="app-shell">
	<div class="header">
		<div class="welcome">
			{#if currentUser}
				Welcome, {currentUser.displayName || 'Gio Tsartsidze'}
			{:else if currentUser === null}
				Welcome, Guest
			{/if}
		</div>
		<div class="header-actions">
			<button on:click={toggleDarkMode} class="theme-toggle" title="Toggle dark mode">
				{#if $darkMode}
					☀️
				{:else}
					🌙
				{/if}
			</button>
			<button on:click={logout} class="sign-out" disabled={!currentUser}>Sign Out</button>
		</div>
	</div>

	<div class="hero">
		<h1>AI Namu Namu</h1>
		<p>Your personal culinary muse. Transform ingredients into delicious meals.</p>
	</div>

	<div class="action-buttons">
		<button class="guide-btn" on:click={startTutorialAgain} disabled={!currentUser}>📖 Guide</button>
		<button class="view-saved" on:click={() => { showFavorites = !showFavorites; }} disabled={!currentUser}>
			💾 {showFavorites ? "Hide" : "View"} Saved Recipes ({$favoriteRecipes.length})
		</button>
	</div>

	{#if currentUser === undefined}
		<div class="card">
			<div class="loading-message">
				<div class="spinner"></div>
				Authenticating user session...
			</div>
		</div>

	{:else if !currentUser}
		<div class="card unauthorized-card">
			<h2>Access Required</h2>
			<p>You must be signed in to generate content and manage your favorites.</p>
			<a href="/login" class="generate-btn" style="display: inline-block; text-decoration: none; margin-top: 20px;">Go to Login Page</a>
		</div>

	{:else}
		{#if showFavorites}
			<div class="card">
				<FavoriteList />
			</div>
		{:else}
			<div class="tabs">
				<div class="tab" class:active={currentMode === 'recipe'} on:click={() => { resetModes(); currentMode = 'recipe'; }}>Single Recipe</div>
				<div class="tab" class:active={currentMode === 'planner'} on:click={() => { resetModes(); currentMode = 'planner'; }}>7-Day Meal Plan</div>
				<div class="tab" class:active={currentMode === 'health'} on:click={() => { resetModes(); currentMode = 'health'; }}>Health Analysis</div>
				<div class="tab" class:active={currentMode === 'calorie'} on:click={() => { resetModes(); currentMode = 'calorie'; }}>Calorie Analysis</div>
			</div>

			<div class="card">
				<form on:submit|preventDefault={generateContent}>
					{#if currentMode === 'health'}
						<BiometricForm
							bind:gender={gender} bind:age={age} bind:weight={weight}
							bind:height={height} bind:activityLevel={activityLevel}
							{isLoading}
						/>
					{:else if currentMode === 'calorie'}
						<div class="section-title">Upload Food Image</div>
						<div class="image-upload-group">
							<label for="food-image" class="upload-area {imageFile ? 'has-file' : ''}">
								{#if imageBase64}
									<img src="data:{imageMimeType};base64,{imageBase64}" alt="Uploaded Food" class="food-preview-image" />
									<p class="replace-text">Click to change image</p>
								{:else}
									<div class="upload-placeholder">
										<span class="upload-icon">📷</span>
										<p class="upload-text">Click to upload food image</p>
									</div>
								{/if}

								<input
									type="file"
									id="food-image"
									accept="image/jpeg, image/png, image/gif"
									on:change={handleImageUpload}
									disabled={isLoading}
									style="display: none;"
								/>
							</label>
						</div>
					{:else}
						<div class="section-title">Your Ingredients</div>
						<div class="input-group">
							<div class="ingredients-container">
								<input
									type="text"
									bind:value={ingredientInput}
									on:keydown={handleKeyDown}
									placeholder="Type ingredient and press Enter..."
									disabled={isLoading}
								/>
								<button type="button" class="add-btn" on:click={addIngredient} disabled={isLoading}>+</button>
							</div>
							<div class="ingredient-tags">
								{#each ingredients as ingredient}
									<div class="tag">
										{ingredient}
										<span class="tag-remove" on:click={() => removeIngredient(ingredient)}>×</span>
									</div>
								{/each}
							</div>
						</div>

						<div class="section-title">Dietary Needs (optional)</div>
						<div class="input-group">
							<input type="text" bind:value={dietaryRestrictions} placeholder="e.g., vegetarian, low-carb, no dairy" disabled={isLoading} />
						</div>

						<div class="section-title">Medical Conditions / Allergies (optional)</div>
						<div class="input-group">
							<input type="text" bind:value={medicalConditions} placeholder="e.g., Diabetic, High Blood Pressure, Gluten Allergy" disabled={isLoading} />
						</div>

						<div class="note">
							<strong>Note:</strong> Always consult a professional for medical advice.
						</div>
					{/if}

					<button type="submit" disabled={isLoading} class="generate-btn">
						{#if isLoading}
							<span class="spinner-inline"></span>
							Generating...
						{:else}
							Generate {currentMode === 'recipe' ? 'Recipe' : currentMode === 'planner' ? 'Plan' : currentMode === 'health' ? 'Health Analysis' : 'Calorie Estimate'}
						{/if}
					</button>

					{#if errorMessage}
						<p class="error">{errorMessage}</p>
					{/if}
				</form>
			</div>

			{#if hasGenerated || $recipeContent || $planContent || $tdeeContent || $calorieContent}
				<div class="card output-card">
					<h2 class="output-title">
						{currentMode === 'recipe' ? 'Recipe Result' : currentMode === 'planner' ? 'Meal Plan Result' : currentMode === 'health' ? 'Health Analysis Result' : 'Calorie Analysis Result'}
					</h2>

					{#if isLoading}
						<div class="loading-message">
							<div class="spinner"></div>
							Chef is processing your {currentMode === 'health' ? 'profile' : currentMode === 'recipe' ? 'meal' : currentMode === 'planner' ? 'plan' : 'image'}...
						</div>

					{:else if currentMode === 'recipe' && $recipeContent}
						{#if isCookingMode}
							<CookingMode markdownContent={$recipeContent} />
							<button on:click={() => isCookingMode = false} class="generate-btn exit-cook-btn">
								Exit Cooking Mode
							</button>
						{:else}
							<div class="recipe-actions">
								<button on:click={() => isCookingMode = true} class="action-btn cook-mode-btn">
									🧑‍🍳 Start Cooking Mode
								</button>
								<button on:click={saveCurrentRecipe} class="action-btn save-btn">⭐ Save Recipe</button>
								<button on:click={() => { showCalendarForm = !showCalendarForm; }} class="action-btn calendar-btn">
									📅 Schedule Meal
								</button>
							</div>

							{#if showCalendarForm}
								<div class="schedule-form">
									<h4>Set Cooking Time</h4>
									<div class="schedule-inputs">
										<input type="date" bind:value={scheduleDate} min={new Date().toISOString().substring(0, 10)} />
										<input type="time" bind:value={scheduleTime} />
										<button on:click={() => {
											const match = $recipeContent.match(/#+\s*Recipe Title:\s*(.*)/i);
											const title = match ? match[1].trim() : 'AI Generated Recipe';
											addToCalendar(title, scheduleDate, scheduleTime);
										}} class="schedule-submit">
											Add to Calendar
										</button>
									</div>
								</div>
							{/if}

							<MarkdownRenderer markdownContent={$recipeContent} />
						{/if}

					{:else if currentMode === 'planner' && $planContent}
						<div class="recipe-actions">
							<button on:click={saveCurrentPlan} class="action-btn save-btn">⭐ Save Plan</button>
							<button on:click={printPlan} class="action-btn">⬇️ Download PDF</button>
						</div>
						<MarkdownRenderer markdownContent={$planContent} />

					{:else if currentMode === 'health' && $tdeeContent}
						<MarkdownRenderer markdownContent={$tdeeContent} />

					{:else if currentMode === 'calorie' && $calorieContent}
						<MarkdownRenderer markdownContent={$calorieContent} />

					{:else}
						<p style="color: #a5b5be; text-align: center; padding: 20px;">
							Enter your constraints above to get started!
						</p>
					{/if}
				</div>
			{/if}
		{/if}
	{/if}
</div>

{#if showTutorial}
	<TutorialOverlay
		onFinish={handleTutorialFinish}
		onModeChange={handleModeChange}
	/>
{/if}

{#if currentMode === 'health' && $tdeeContent && showGoalForm && !isSubscribed}
	<div class="card goal-form-card">
		<GoalSettingForm
			bind:targetWeight={targetWeight}
			bind:targetTimeframe={targetTimeframe}
			bind:ingredientInput={ingredientInput}
			bind:ingredients={ingredients}
			bind:errorMessage={errorMessage}
			{handleGoalSubmission}
			{addIngredient}
			{removeIngredient}
			{handleKeyDown}
		/>
	</div>
{/if}

{#if isSubscribed && currentMode === 'health'}
	<div class="card output-card">
		<h2 class="output-title">Your Personalized Goal Plan</h2>
		<p class="plan-subtitle">This plan is tailored to hit your goal weight of {targetWeight}kg in {targetTimeframe} weeks.</p>

		{#if isLoading}
			<div class="loading-message">
				<div class="spinner"></div>
				Generating your calorie-restricted plan...
			</div>
		{:else}
			<div class="recipe-actions">
				<button on:click={saveCurrentPlan} class="action-btn save-btn">⭐ Save Plan</button>
				<button on:click={printPlan} class="action-btn">⬇️ Download PDF</button>
			</div>
			<MarkdownRenderer markdownContent={$goalPlanContent} />
		{/if}
	</div>
{/if}

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :global(body) {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #c6dddb 0%, #92a4ac 40%, #f9fbfd 100%);
        min-height: 100vh;
        padding: 20px;
        position: relative;
        overflow-x: hidden;
        transition: background 0.3s ease, color 0.3s ease;
    }

    :global(body.dark-mode) {
        background: linear-gradient(135deg, #2D2D35 0%, #3D3D48 50%, #4A4A55 100%);
    }

    :global(body::before) {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image:
                radial-gradient(circle at 20% 30%, rgba(88, 104, 121, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(198, 221, 219, 0.12) 0%, transparent 50%);
        pointer-events: none;
        transition: opacity 0.3s ease;
    }

    :global(body.dark-mode::before) {
        background-image:
                radial-gradient(circle at 20% 30%, rgba(90, 90, 105, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(70, 70, 85, 0.08) 0%, transparent 50%);
    }

    .app-shell {
        max-width: 1200px;
        margin: 0 auto;
        position: relative;
        z-index: 1;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 45px;
        padding: 0 20px;
    }

    .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .theme-toggle {
        background: rgba(255, 255, 255, 0.08);
        color: #586879;
        border: 1px solid rgba(146, 164, 172, 0.3);
        padding: 8px 16px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    }

    .theme-toggle:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(88, 104, 121, 0.15);
    }

    :global(.dark-mode) .theme-toggle {
        background: rgba(255, 255, 255, 0.08);
        color: #D4D4E0;
        border-color: rgba(255, 255, 255, 0.15);
    }

    :global(.dark-mode) .theme-toggle:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
    }

    .welcome {
        color: #586879;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.5px;
    }

    :global(.dark-mode) .welcome {
        color: #151558;
    }

    .sign-out {
        background: rgba(146, 164, 172, 0.2);
        color: #586879;
        border: 1px solid rgba(146, 164, 172, 0.3);
        padding: 8px 24px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        letter-spacing: 0.5px;
    }

    .sign-out:hover:not(:disabled) {
        background: rgba(146, 164, 172, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(88, 104, 121, 0.15);
    }

    :global(.dark-mode) .sign-out {
        background: rgba(255, 255, 255, 0.18);
        color: #151558;
        border-color: rgba(255, 255, 255, 0.15);
    }

    :global(.dark-mode) .sign-out:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
    }

    .sign-out:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .hero {
        text-align: center;
        margin-bottom: 55px;
    }

    .hero h1 {
        font-size: 56px;
        color: #586879;
        margin-bottom: 14px;
        font-weight: 300;
        letter-spacing: 4px;
        font-family: 'Georgia', serif;
        transition: color 0.3s ease;
    }

    :global(.dark-mode) .hero h1 {
        color: #151558;
    }

    .hero p {
        color: #7a8996;
        font-size: 15px;
        letter-spacing: 0.3px;
        transition: color 0.3s ease;
    }

    :global(.dark-mode) .hero p {
        color: #151558;
    }

    .action-buttons {
        text-align: center;
        margin-bottom: 38px;
    }

    .guide-btn, .view-saved {
        padding: 11px 28px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.3s ease;
        font-weight: 500;
        letter-spacing: 0.5px;
        border: none;
    }

    .guide-btn {
        background: #586879;
        color: #f9fbfd;
        margin-right: 12px;
        box-shadow: 0 4px 15px rgba(88, 104, 121, 0.25);
    }

    .guide-btn:hover:not(:disabled) {
        background: #485566;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(88, 104, 121, 0.35);
    }

    :global(.dark-mode) .guide-btn {
        background: #5A5A6D;
        color: #FFFFFF;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    :global(.dark-mode) .guide-btn:hover:not(:disabled) {
        background: #4A4A5D;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .view-saved {
        background: rgba(249, 251, 253, 0.6);
        border: 1px solid rgba(146, 164, 172, 0.3);
        color: #586879;
        backdrop-filter: blur(10px);
    }

    .view-saved:hover:not(:disabled) {
        background: rgba(249, 251, 253, 0.8);
        transform: translateY(-2px);
    }

    :global(.dark-mode) .view-saved {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.15);
        color: #D4D4E0;
    }

    :global(.dark-mode) .view-saved:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.12);
    }

    .guide-btn:disabled, .view-saved:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .tabs {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-bottom: 38px;
        flex-wrap: wrap;
    }

    .tab {
        background: rgba(249, 251, 253, 0.5);
        border: 1px solid rgba(146, 164, 172, 0.25);
        padding: 12px 28px;
        border-radius: 25px;
        cursor: pointer;
        color: #586879;
        font-size: 13px;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        letter-spacing: 0.5px;
    }

    .tab.active {
        background: #92a4ac;
        color: white;
        border-color: #92a4ac;
        box-shadow: 0 4px 15px rgba(146, 164, 172, 0.3);
    }

    .tab:hover:not(.active) {
        background: rgba(249, 251, 253, 0.7);
        transform: translateY(-2px);
    }

    :global(.dark-mode) .tab {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
        color: #151558;
    }

    :global(.dark-mode) .tab.active {
        background: #5A5A6D;
        color: #FFFFFF;
        border-color: #5A5A6D;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    :global(.dark-mode) .tab:hover:not(.active) {
        background: rgba(255, 255, 255, 0.08);
    }

    .card {
        max-width: 800px;
        margin: 0 auto 30px;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(30px);
        border-radius: 25px;
        padding: 48px;
        box-shadow: 0 20px 60px rgba(88, 104, 121, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.6);
        transition: all 0.3s ease;
    }

    :global(.dark-mode) .card {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .section-title {
        color: #586879;
        font-size: 12px;
        margin-bottom: 18px;
        font-weight: 600;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        transition: color 0.3s ease;
    }

    :global(.dark-mode) .section-title {
        color: #D4D4E0;
    }

    .input-group {
        margin-bottom: 30px;
    }

    .ingredients-container {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
    }

    input:not([type="file"]) {
        flex: 1;
        padding: 16px 22px;
        border: 1px solid rgba(146, 164, 172, 0.3);
        border-radius: 15px;
        font-size: 14px;
        color: #586879;
        background: rgba(255, 255, 255, 0.9);
        transition: all 0.3s ease;
        width: 100%;
    }

    :global(.dark-mode) input:not([type="file"]) {
        border-color: rgba(255, 255, 255, 0.15);
        color: #E8E8F0;
        background: rgba(255, 255, 255, 0.08);
    }

    input:focus {
        outline: none;
        border-color: #92a4ac;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(146, 164, 172, 0.12);
    }

    :global(.dark-mode) input:focus {
        border-color: #5A5A6D;
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 0 0 3px rgba(90, 90, 109, 0.2);
    }

    input::placeholder {
        color: #a5b5be;
    }

    :global(.dark-mode) input::placeholder {
        color: #787888;
    }

    input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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

    :global(.dark-mode) .add-btn {
        background: #5A5A6D;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    :global(.dark-mode) .add-btn:hover:not(:disabled) {
        background: #4A4A5D;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .add-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .ingredient-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
        min-height: 40px;
    }

    .tag {
        background: linear-gradient(135deg, #c6dddb 0%, #b3ccc9 100%);
        color: #586879;
        padding: 10px 18px;
        border-radius: 22px;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.4s ease;
        box-shadow: 0 3px 12px rgba(198, 221, 219, 0.3);
        letter-spacing: 0.3px;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    :global(.dark-mode) .tag {
        background: rgba(255, 255, 255, 0.12);
        color: #E8E8F0;
        border: 1px solid rgba(255, 255, 255, 0.15);
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .tag-remove {
        cursor: pointer;
        font-weight: bold;
        opacity: 0.7;
        transition: opacity 0.2s;
        font-size: 16px;
    }

    .tag-remove:hover {
        opacity: 1;
    }

    .note {
        background: rgba(198, 221, 219, 0.25);
        color: #586879;
        padding: 16px;
        border-radius: 12px;
        font-size: 12px;
        margin-top: 24px;
        border-left: 3px solid #92a4ac;
        line-height: 1.6;
        letter-spacing: 0.2px;
        transition: all 0.3s ease;
    }

    :global(.dark-mode) .note {
        background: rgba(90, 90, 109, 0.2);
        color: #B8B8C5;
        border-left-color: #5A5A6D;
    }

    .generate-btn {
        width: 100%;
        background: linear-gradient(135deg, #586879 0%, #485566 100%);
        color: #f9fbfd;
        border: none;
        padding: 18px;
        border-radius: 15px;
        font-size: 13px;
        cursor: pointer;
        margin-top: 32px;
        transition: all 0.3s ease;
        font-weight: 500;
        letter-spacing: 1.8px;
        box-shadow: 0 6px 25px rgba(88, 104, 121, 0.3);
        text-transform: uppercase;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .generate-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #485566 0%, #3a4453 100%);
        transform: translateY(-2px);
        box-shadow: 0 10px 35px rgba(88, 104, 121, 0.4);
    }

    :global(.dark-mode) .generate-btn {
        background: #5A5A6D;
        color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    :global(.dark-mode) .generate-btn:hover:not(:disabled) {
        background: #4A4A5D;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .generate-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .error {
        background: rgba(231, 76, 60, 0.1);
        color: #c0392b;
        padding: 12px;
        border-radius: 8px;
        margin-top: 15px;
        font-size: 14px;
        border: 1px solid rgba(231, 76, 60, 0.3);
    }

    .loading-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: #586879;
        font-size: 14px;
        gap: 15px;
        transition: color 0.3s ease;
    }

    :global(.dark-mode) .loading-message {
        color: #B8B8C5;
    }

    .spinner {
        border: 4px solid rgba(88, 104, 121, 0.1);
        border-top: 4px solid #586879;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
    }

    :global(.dark-mode) .spinner {
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top-color: #5A5A6D;
    }

    .spinner-inline {
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top: 3px solid white;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        animation: spin 1s linear infinite;
        display: inline-block;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .output-card {
        margin-top: 30px;
    }

    .output-title {
        color: #586879;
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 25px;
        letter-spacing: 0.5px;
        transition: color 0.3s ease;
    }

    :global(.dark-mode) .output-title {
        color: #D4D4E0;
    }

    .recipe-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 25px;
        flex-wrap: wrap;
    }

    .action-btn {
        background: rgba(249, 251, 253, 0.6);
        border: 1px solid rgba(146, 164, 172, 0.3);
        color: #586879;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        letter-spacing: 0.5px;
        font-weight: 500;
    }

    .action-btn:hover {
        background: rgba(249, 251, 253, 0.8);
        transform: translateY(-2px);
    }

    :global(.dark-mode) .action-btn {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.15);
        color: #D4D4E0;
    }

    :global(.dark-mode) .action-btn:hover {
        background: rgba(255, 255, 255, 0.12);
    }

    .save-btn {
        background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
        color: #2c3e50;
        border: none;
        box-shadow: 0 4px 15px rgba(241, 196, 15, 0.3);
    }

    .save-btn:hover {
        background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
        box-shadow: 0 6px 20px rgba(241, 196, 15, 0.4);
    }

    .cook-mode-btn {
        background: linear-gradient(135deg, #586879 0%, #485566 100%);
        color: white;
        border: none;
        box-shadow: 0 4px 15px rgba(88, 104, 121, 0.25);
    }

    .cook-mode-btn:hover {
        background: linear-gradient(135deg, #485566 0%, #3a4453 100%);
        box-shadow: 0 6px 20px rgba(88, 104, 121, 0.35);
    }

    :global(.dark-mode) .cook-mode-btn {
        background: #5A5A6D;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    :global(.dark-mode) .cook-mode-btn:hover {
        background: #4A4A5D;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .exit-cook-btn {
        margin-top: 20px;
        background: rgba(146, 164, 172, 0.2);
        color: #586879;
    }

    :global(.dark-mode) .exit-cook-btn {
        background: rgba(255, 255, 255, 0.08);
        color: #D4D4E0;
    }

    .schedule-form {
        background: rgba(198, 221, 219, 0.25);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 25px;
        border-left: 3px solid #92a4ac;
        transition: all 0.3s ease;
    }

    :global(.dark-mode) .schedule-form {
        background: rgba(90, 90, 109, 0.2);
        border-left-color: #5A5A6D;
    }

    .schedule-form h4 {
        color: #586879;
        font-size: 14px;
        margin-bottom: 15px;
        font-weight: 600;
        letter-spacing: 0.5px;
        transition: color 0.3s ease;
    }

    :global(.dark-mode) .schedule-form h4 {
        color: #D4D4E0;
    }

    .schedule-inputs {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .schedule-inputs input {
        flex: 1;
        min-width: 150px;
    }

    .schedule-submit {
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        color: white;
        border: none;
        padding: 16px 24px;
        border-radius: 15px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    }

    .schedule-submit:hover {
        background: linear-gradient(135deg, #2980b9 0%, #21618c 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
    }

    .plan-subtitle {
        color: #7a8996;
        font-size: 14px;
        margin-bottom: 20px;
        font-style: italic;
        transition: color 0.3s ease;
    }

    :global(.dark-mode) .plan-subtitle {
        color: #9898A8;
    }

    .unauthorized-card {
        text-align: center;
        padding: 60px 48px;
    }

    .unauthorized-card h2 {
        color: #e74c3c;
        margin-bottom: 15px;
        font-size: 28px;
    }

    .unauthorized-card p {
        color: #586879;
        font-size: 16px;
        margin-bottom: 20px;
        transition: color 0.3s ease;
    }

    :global(.dark-mode) .unauthorized-card p {
        color: #B8B8C5;
    }

    .image-upload-group {
        margin-bottom: 30px;
    }

    .upload-area {
        min-height: 200px;
        border: 2px dashed rgba(146, 164, 172, 0.3);
        border-radius: 15px;
        background: rgba(249, 251, 253, 0.8);
        padding: 30px;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        cursor: pointer;
    }

    .upload-area:hover {
        border-color: #92a4ac;
        background: rgba(249, 251, 253, 0.95);
    }

    :global(.dark-mode) .upload-area {
        border-color: rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.08);
    }

    :global(.dark-mode) .upload-area:hover {
        border-color: #5A5A6D;
        background: rgba(255, 255, 255, 0.12);
    }

    .upload-area.has-file {
        border-style: solid;
        border-color: #92a4ac;
    }

    :global(.dark-mode) .upload-area.has-file {
        border-color: #5A5A6D;
    }

    .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .upload-icon {
        font-size: 48px;
    }

    .upload-text {
        color: #586879;
        font-weight: 500;
        font-size: 14px;
        transition: color 0.3s ease;
    }

    :global(.dark-mode) .upload-text {
        color: #B8B8C5;
    }

    .food-preview-image {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
        border-radius: 12px;
        margin-bottom: 10px;
    }

    .replace-text {
        color: #586879;
        font-size: 13px;
        font-weight: 500;
        margin-top: 10px;
        transition: color 0.3s ease;
    }

    :global(.dark-mode) .replace-text {
        color: #B8B8C5;
    }

    .goal-form-card {
        margin-top: 30px;
    }

    @media (max-width: 768px) {
        .hero h1 {
            font-size: 42px;
            letter-spacing: 2px;
        }

        .hero p {
            font-size: 14px;
        }

        .card {
            padding: 32px 24px;
        }

        .tabs {
            flex-wrap: wrap;
        }

        .tab {
            flex: 1 1 calc(50% - 12px);
            min-width: 140px;
        }

        .header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
        }

        .header-actions {
            width: 100%;
            justify-content: center;
        }

        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
        }

        .guide-btn, .view-saved {
            margin: 0;
            width: 100%;
            max-width: 300px;
        }

        .ingredients-container {
            flex-direction: column;
        }

        .add-btn {
            width: 100%;
        }

        .recipe-actions {
            flex-direction: column;
        }

        .action-btn {
            width: 100%;
        }

        .schedule-inputs {
            flex-direction: column;
        }

        .schedule-inputs input,
        .schedule-submit {
            width: 100%;
        }
    }
</style>