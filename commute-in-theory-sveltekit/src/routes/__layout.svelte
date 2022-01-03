<div>
    <!-- The slot represents the components specific to each page -->
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
