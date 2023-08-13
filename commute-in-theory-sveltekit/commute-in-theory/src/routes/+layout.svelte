<script>
	import '../app.postcss';
	import { dev } from '$app/environment';

	// Enable Vercel analytics
	import { inject } from '@vercel/analytics';
	inject({ mode: dev ? 'development' : 'production' });
</script>

<div class="text-2xl font-semibold w-full p-4 border-b">Commute in Theory</div>

<div class="min-h-screen bg-slate-50 py-4">
	<div class="container mx-auto max-w-screen-xl">
		<slot />
	</div>
</div>
