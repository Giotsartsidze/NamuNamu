<script lang="ts">
	export let gender: 'male' | 'female' | '';
	export let age: number | string;
	export let weight: number | string;
	export let height: number | string;
	export let activityLevel: 'Sedentary' | 'Moderate' | 'Active' | '';
	export let isLoading: boolean;
</script>

<div class="section-title">Your Biometric Profile</div>

<div class="input-group">
	<label for="gender" class="input-label">Gender</label>
	<select id="gender" bind:value={gender} disabled={isLoading} class="select-input">
		<option value="" disabled>Select Gender</option>
		<option value="male">Male</option>
		<option value="female">Female</option>
	</select>
</div>

<div class="input-group">
	<label for="activity" class="input-label">Activity Level</label>
	<select id="activity" bind:value={activityLevel} disabled={isLoading} class="select-input">
		<option value="" disabled>Select Activity</option>
		<option value="Sedentary">Sedentary (little to no exercise)</option>
		<option value="Moderate">Moderate (3-5 days/week)</option>
		<option value="Active">Active (daily intense exercise)</option>
	</select>
</div>

<div class="biometrics-row">
	<div class="biometric-field">
		<label for="age" class="input-label">Age</label>
		<input
			type="number"
			id="age"
			bind:value={age}
			placeholder="Years"
			min="15"
			disabled={isLoading}
			class="number-input"
		>
	</div>
	<div class="biometric-field">
		<label for="weight" class="input-label">Weight (kg)</label>
		<input
			type="number"
			id="weight"
			bind:value={weight}
			placeholder="kg"
			min="30"
			disabled={isLoading}
			class="number-input"
		>
	</div>
	<div class="biometric-field">
		<label for="height" class="input-label">Height (cm)</label>
		<input
			type="number"
			id="height"
			bind:value={height}
			placeholder="cm"
			min="100"
			disabled={isLoading}
			class="number-input"
		>
	</div>
</div>

<style>
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

    .input-label {
        display: block;
        color: #586879;
        font-size: 12px;
        margin-bottom: 10px;
        font-weight: 500;
        letter-spacing: 0.5px;
        transition: color 0.3s ease;
    }

    :global(.dark-mode) .input-label {
        color: #B8B8C5;
    }

    .select-input,
    .number-input {
        width: 100%;
        padding: 16px 22px;
        border: 1px solid rgba(146, 164, 172, 0.3);
        border-radius: 15px;
        font-size: 14px;
        color: #586879;
        background: rgba(255, 255, 255, 0.9);
        transition: all 0.3s ease;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    :global(.dark-mode) .select-input,
    :global(.dark-mode) .number-input {
        border-color: rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.08);
    }

    .select-input:focus,
    .number-input:focus {
        outline: none;
        border-color: #92a4ac;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(146, 164, 172, 0.12);
    }

    :global(.dark-mode) .select-input:focus,
    :global(.dark-mode) .number-input:focus {
        border-color: #5A5A6D;
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 0 0 3px rgba(90, 90, 109, 0.2);
    }

    .select-input::placeholder,
    .number-input::placeholder {
        color: #a5b5be;
    }

    :global(.dark-mode) .select-input::placeholder,
    :global(.dark-mode) .number-input::placeholder {
        color: #787888;
    }

    .select-input:disabled,
    .number-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .biometrics-row {
        display: flex;
        gap: 15px;
        margin-bottom: 30px;
				align-items: center;
				justify-content: space-between;
    }

    .biometric-field {
        min-width: 0;
    }

    /* Styling for select dropdowns */
    .select-input {
        cursor: pointer;
        appearance: none;
        background-repeat: no-repeat;
        background-position: right 16px center;
        padding-right: 45px;
    }


    .select-input option {
        background: #ffffff;
        color: #586879;
        padding: 10px;
    }

    :global(.dark-mode) .select-input option {
        background: #3D3D48;
        color: #E8E8F0;
    }

    /* Remove number input spinners for cleaner look */
    .number-input::-webkit-inner-spin-button,
    .number-input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .number-input[type=number] {
        -moz-appearance: textfield;
    }

    @media (max-width: 768px) {
        .biometrics-row {
            flex-direction: column;
            gap: 20px;
        }

        .biometric-field {
            width: 100%;
        }
    }
</style>