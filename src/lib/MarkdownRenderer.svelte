<script lang="ts">
	import { marked } from 'marked';
	import { onMount } from 'svelte';

	export let markdownContent: string;

	$: htmlContent = marked.parse(markdownContent);

	onMount(() => {

	});
</script>

<div class="markdown-output">
	{@html htmlContent}
</div>

<style>
    .markdown-output {
        padding: 0;
        border: none;
        margin: 0;
    }
    .markdown-output :global(h1),
    .markdown-output :global(h2),
    .markdown-output :global(h3) {
        margin-top: 20px;
        margin-bottom: 10px;
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
    }

    .markdown-output :global(h2) {
        font-size: 1.5em;
        color: #007bff;
    }

    .markdown-output :global(p) {
        line-height: 1.6;
        margin-bottom: 10px;
    }

    .markdown-output :global(strong) {
        font-weight: bold;
        color: #007bff;
    }

    .markdown-output :global(ul) {
        padding-left: 20px;
        margin-bottom: 15px;
    }
    .markdown-output :global(li) {
        margin-bottom: 5px;
        line-height: 1.4;
    }
</style>