<script>
    import Aside from './Aside.svelte'
    import Main from './Main.svelte'
    import { onMount } from 'svelte';

    let transfer;

    onMount(async () => {
        const hash = window.location.search.slice(1).toString();

        if (!hash || hash.length < 59) {
            return;
        }

        let to, token, amount;

        const decoded = window.atob(decodeURI(hash));

        [to, token, amount] = decoded.split('|');

        transfer = {to, token, amount};
    });
</script>

<Aside />

<Main {...transfer} />
