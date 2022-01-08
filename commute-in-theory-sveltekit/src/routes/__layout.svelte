<script>
    import { UnprocessedCommutes } from '$lib/stores/CommuteStore'
</script>

<div class="flex justify-center items-center mb-6 border-b">
    <div class="flex justify-between items-center w-full max-w-screen-xl p-4">
        <span class="text-2xl">Commute in Theory</span>
        <span>
            Commutes:
            <span class="font-semibold">
                {$UnprocessedCommutes.length}
            </span>
        </span>
    </div>
</div>

<div class="mx-16 my-4">
    <slot></slot>
</div>

<style>
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    /* .btn {
        @apply rounded-full;
    } */

    :global(h1) {
        @apply text-3xl;
    }

    :global(h2) {
        @apply text-2xl;
    }

    :global(h3) {
        @apply text-lg;
    }
</style>
