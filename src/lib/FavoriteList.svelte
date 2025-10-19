<script lang="ts">
	import { favoriteRecipes, removeFavorite, type Recipe } from '../stores/favoritesStore';
	import MarkdownRenderer from '$lib/MarkdownRenderer.svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	export let scheduleRecipeToCalendar: ((recipeTitle: string, dateStr: string, timeStr: string) => void) | undefined = undefined;

	let expandedRecipeId: number | null = null;

	let schedulingStates: { [key: number]: { show: boolean, date: string, time: string } } = {};

	onMount(() => {
		const today = new Date().toISOString().substring(0, 10);

		$favoriteRecipes.forEach(recipe => {
			schedulingStates[recipe.id] = {
				show: false,
				date: today,
				time: '19:00'
			};
		});
	});

	function ensureSchedulingState(id: number) {
		if (!schedulingStates[id]) {
			const today = new Date().toISOString().substring(0, 10);
			schedulingStates[id] = {
				show: false,
				date: today,
				time: '19:00'
			};
		}
	}

	function toggleExpand(id: number) {
		expandedRecipeId = expandedRecipeId === id ? null : id;
	}

	function toggleScheduleForm(id: number) {
		ensureSchedulingState(id);
		schedulingStates[id].show = !schedulingStates[id].show;
		schedulingStates = schedulingStates;
	}

	function scheduleAndDownload(recipe: Recipe) {
		const state = schedulingStates[recipe.id];

		if (!state.date || !state.time) {
			alert('Please select both a date and a time.');
			return;
		}

		const match = recipe.content.match(/#+\s*Recipe Title:\s*(.*)/i);
		const title = match ? match[1].trim() : recipe.title;

		if (scheduleRecipeToCalendar) {
			scheduleRecipeToCalendar(title, state.date, state.time);
		} else {
			const scheduleDateTime = new Date(`${state.date}T${state.time}:00`);
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
SUMMARY:Cook ${title}
DESCRIPTION:Time to start cooking! Recipe: ${title}
END:VEVENT
END:VCALENDAR`;

			const blob = new Blob([calendarContent], { type: 'text/calendar;charset=utf-8' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = `Cook_${title.replace(/\s/g, '_')}.ics`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			alert(`Successfully scheduled "${title}" for ${state.date} at ${state.time}!`);
		}

		state.show = false;
		schedulingStates = schedulingStates;
	}
</script>

<div class="favorites-container">
	<h2 class="favorites-title">Your Saved Culinary Creations</h2>

	{#if $favoriteRecipes.length === 0}
		<div class="empty-state">
			<span class="empty-icon">🍳</span>
			<p>No recipes saved yet. Time to explore new flavors!</p>
		</div>
	{:else}
		<div class="recipe-grid">
			{#each $favoriteRecipes as recipe (recipe.id)}
				{#if schedulingStates[recipe.id]}
					<div class="recipe-card" transition:fly={{ y: 20, duration: 300 }}>
						<div class="card-header">
							<h3 class="recipe-title">{recipe.title}</h3>
							<button
								class="remove-btn"
								on:click={() => removeFavorite(recipe.id)}
								title="Remove from favorites"
							>
								×
							</button>
						</div>

						<p class="saved-date">
							<span class="date-label">Saved:</span>
							<span class="date-text">{new Date(recipe.timestamp).toLocaleDateString()}</span>
						</p>

						<div class="card-actions">
							<button
								on:click={() => toggleScheduleForm(recipe.id)}
								class="action-btn schedule-btn"
								class:active={schedulingStates[recipe.id].show}
							>
								📅 {schedulingStates[recipe.id].show ? 'Cancel' : 'Schedule'}
							</button>

							<button
								class="action-btn view-btn"
								on:click={() => toggleExpand(recipe.id)}
							>
								{expandedRecipeId === recipe.id ? '📖 Hide' : '📖 View'}
							</button>
						</div>

						{#if schedulingStates[recipe.id].show}
							<div class="schedule-form" transition:fly={{ y: -10, duration: 200 }}>
								<p class="schedule-form-title">Set Cooking Time</p>
								<div class="schedule-inputs">
									<input
										type="date"
										bind:value={schedulingStates[recipe.id].date}
										class="schedule-input"
										min={new Date().toISOString().substring(0, 10)}
									/>
									<input
										type="time"
										bind:value={schedulingStates[recipe.id].time}
										class="schedule-input"
									/>
								</div>
								<button
									on:click={() => scheduleAndDownload(recipe)}
									class="schedule-submit"
								>
									Add to Calendar
								</button>
							</div>
						{/if}

						{#if expandedRecipeId === recipe.id}
							<div
								class="expanded-content"
								transition:fly={{ y: 20, duration: 300 }}
							>
								<MarkdownRenderer markdownContent={recipe.content} />
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
    .favorites-container {
        padding: 0;
    }

    .favorites-title {
        color: #586879;
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 35px;
        text-align: center;
        letter-spacing: 0.5px;
    }

    .empty-state {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(30px);
        border-radius: 25px;
        padding: 60px 40px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 20px 60px rgba(88, 104, 121, 0.12);
    }

    .empty-icon {
        font-size: 64px;
        display: block;
        margin-bottom: 20px;
    }

    .empty-state p {
        color: #7a8996;
        font-size: 16px;
        letter-spacing: 0.3px;
    }

    .recipe-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 25px;
    }

    .recipe-card {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(30px);
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 15px 40px rgba(88, 104, 121, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.6);
        transition: all 0.3s ease;
        position: relative;
    }

		:global(.dark-mode) .recipe-card {
			backdrop-filter: blur(30px);
			border-radius: 20px;
			padding: 30px;
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
		}

    .recipe-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 50px rgba(88, 104, 121, 0.15);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
        gap: 15px;
    }

    .recipe-title {
        font-size: 18px;
        font-weight: 600;
        color: #586879;
        line-height: 1.4;
        margin: 0;
        letter-spacing: 0.3px;
        flex: 1;
    }

    .remove-btn {
        background: rgba(231, 76, 60, 0.1);
        color: #e74c3c;
        border: 1px solid rgba(231, 76, 60, 0.2);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 20px;
        font-weight: 600;
        transition: all 0.3s ease;
        flex-shrink: 0;
        padding: 0;
        line-height: 1;
    }

    .remove-btn:hover {
        background: rgba(231, 76, 60, 0.2);
        transform: scale(1.1);
    }

    .saved-date {
        font-size: 12px;
        color: #a5b5be;
        margin-bottom: 20px;
        letter-spacing: 0.3px;
    }

    .date-label {
        font-weight: 600;
        color: #7a8996;
    }

    .date-text {
        color: #586879;
        font-weight: 500;
    }

    .card-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    }

    .action-btn {
        flex: 1;
        background: rgba(249, 251, 253, 0.6);
        border: 1px solid rgba(146, 164, 172, 0.3);
        color: #586879;
        padding: 12px 16px;
        border-radius: 15px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        letter-spacing: 0.5px;
    }

    .action-btn:hover {
        background: rgba(249, 251, 253, 0.8);
        transform: translateY(-2px);
    }

    .schedule-btn.active {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        color: white;
        border-color: #e74c3c;
        box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
    }

    .view-btn {
        background: linear-gradient(135deg, #586879 0%, #485566 100%);
        color: white;
        border: none;
        box-shadow: 0 4px 15px rgba(88, 104, 121, 0.25);
    }

    .view-btn:hover {
        background: linear-gradient(135deg, #485566 0%, #3a4453 100%);
        box-shadow: 0 6px 20px rgba(88, 104, 121, 0.35);
    }

    .schedule-form {
        background: rgba(198, 221, 219, 0.25);
        border-left: 3px solid #92a4ac;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
    }

    .schedule-form-title {
        color: #586879;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
        text-transform: uppercase;
    }

    .schedule-inputs {
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
    }

    .schedule-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid rgba(146, 164, 172, 0.3);
        border-radius: 10px;
        font-size: 13px;
        color: #586879;
        background: rgba(255, 255, 255, 0.9);
        transition: all 0.3s ease;
    }

    .schedule-input:focus {
        outline: none;
        border-color: #92a4ac;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(146, 164, 172, 0.12);
    }

    .schedule-submit {
        width: 100%;
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.5px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    }

    .schedule-submit:hover {
        background: linear-gradient(135deg, #2980b9 0%, #21618c 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
    }

    .expanded-content {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(146, 164, 172, 0.2);
    }

    /* Markdown content styling within expanded section */
    .expanded-content :global(h1),
    .expanded-content :global(h2),
    .expanded-content :global(h3) {
        color: #586879;
        margin-top: 20px;
        margin-bottom: 12px;
        font-weight: 600;
    }

    .expanded-content :global(h1) {
        font-size: 20px;
    }

    .expanded-content :global(h2) {
        font-size: 18px;
    }

    .expanded-content :global(h3) {
        font-size: 16px;
    }

    .expanded-content :global(p) {
        color: #7a8996;
        line-height: 1.7;
        margin-bottom: 12px;
        font-size: 14px;
    }

    .expanded-content :global(ul),
    .expanded-content :global(ol) {
        color: #7a8996;
        padding-left: 20px;
        margin-bottom: 12px;
        font-size: 14px;
        line-height: 1.7;
    }

    .expanded-content :global(li) {
        margin-bottom: 6px;
    }

    .expanded-content :global(strong) {
        color: #586879;
        font-weight: 600;
    }

    .expanded-content :global(code) {
        background: rgba(198, 221, 219, 0.3);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 13px;
        color: #586879;
    }

    .expanded-content :global(pre) {
        background: rgba(198, 221, 219, 0.2);
        padding: 15px;
        border-radius: 10px;
        overflow-x: auto;
        margin-bottom: 15px;
        border-left: 3px solid #92a4ac;
    }

    @media (max-width: 768px) {
        .recipe-grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .recipe-card {
            padding: 24px;
        }

        .recipe-title {
            font-size: 16px;
        }

        .card-actions {
            flex-direction: column;
        }

        .action-btn {
            width: 100%;
        }

        .schedule-inputs {
            flex-direction: column;
        }

        .schedule-input {
            width: 100%;
        }
    }
</style>