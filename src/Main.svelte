<script>
    import { HOME_URL, TOKENS_API } from './Constants'
    import { CheckoutManager } from 'zksync-checkout'
    import { onMount } from 'svelte';

    let form;
    let link;
    let tokens;
    let visible;
    let copied = 'Copy';

    export let to = '';
    export let token = '';
    export let amount = '';

    $: checkout = to;

    const generate = () => {
        const to = form.to.value;
        const token = form.token.value;
        const amount = form.amount.value;

        if (!to) {
            return link = '';
        }

        const hash = [to, token, amount].join('|');
        const encoded = encodeURI(window.btoa(hash).replace(/=/g, ''));

        link = `${HOME_URL}?${encoded}`;
    }

    const create = () => {
        generate();

        form.querySelector('.submit').classList.add('is-hidden');
        form.querySelector('.textarea').classList.remove('is-hidden');

        visible = true;
    }

    const update = () => {
        if (visible) {
            generate();
        }
    }

    const copy = async () => {
        await navigator.clipboard.writeText(form.link.value);

        copied = 'Copied';

        setTimeout(() => copied = 'Copy', 2500);
    }

    const zkCheckout = async () => {
        try {
            const to = form.to.value;
            const token = form.token.value;
            const quantity = form.amount.value;

            if (!to || !token || !quantity) {
                return;
            }

            const { decimals } = tokens.filter(x => x.symbol === token)[0]
            const amount = (quantity * (1 + Array(decimals).fill(0).join(''))).toString()

            const manager = new CheckoutManager('mainnet');
            const signedTransferTx = { to, token, amount };
            const transactions = [signedTransferTx];

            await manager.zkSyncBatchCheckout(transactions, token);
        } catch (error) {
            console.error(error);
        }
    }

    onMount(async () => {
        fetch(TOKENS_API)
        .then(response => {
            if (response.ok) {
                return response.json();
            }

            throw new Error('Fetch tokens network error');
        })
        .then(items => {
            const select = form.querySelector('select[name="token"]');
            const symbols = items.map(item => item.symbol).filter(symbol => !['ETH', 'DAI'].includes(symbol));

            symbols.forEach(symbol => select.add(new Option(symbol)));

            select.value = token;
            tokens = items;
        })
        .catch(error => {
            console.error('Fetch tokens error:', error);
        });
    });
</script>

<style>
    main {
        width: 100%;
        min-height: 100vh;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background: var(--color-main-background);
    }

    form {
        width: 100%;
        padding: 2rem 1rem;
    }

    header {
        text-align: center;
        margin-bottom: 4rem;
    }

    h3 span {
        display: block;
    }

    fieldset {
        display: flex;
    }
    fieldset + fieldset {
        margin-top: 1.5rem;
    }

    fieldset > div {
        width: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    fieldset > div.is-hidden {
        display: none;
    }

    input,
    select,
    button[type=submit],
    textarea {
        display: block;
        width: 100%;
        height: 4rem;
        border-radius: 1rem;
        transition: all .25s;
    }

    input,
    select,
    textarea {
        padding: 0 1.3rem;
        border: 0.2rem solid var(--color-input-border);
        background-color: var(--color-input-background);
    }
    input::placeholder {
        color: var(--color-input-placeholder);
    }
    input[readonly] {
        cursor: default;
    }
    input:hover {
        background-color: transparent;
        border-color: var(--color-input-border-hover);
    }

    select:invalid,
    input:invalid {
        border-color: var(--color-input-border-hover);
    }

    input[readonly]:hover {
        pointer-events: none;
    }

    select {
        width: 9rem;
        -webkit-appearance: none;
        appearance: none;
        background: var(--color-input-background) no-repeat right 1.3rem center;
        background-image: url('../images/arrow.svg');
        background-size: 14px 8px;
        background-clip: border-box;
    }

    button[type=submit] {
        cursor: pointer;
        margin-top: 2rem;
        font-weight: bold;
        color: var(--color-submit);
        background-color: var(--color-submit-background);
    }
    button[type=submit]:hover {
        color: var(--color-submit-hover);
        background-color: var(--color-submit-background-hover);
    }

    textarea {
        border-color: var(--color-page-text-light);
        background-color: transparent;
        padding: .6rem 1.3rem 0;
        word-break: break-all;
        line-height: 1.2rem;
        font-size: .9rem;
        font-family: Consolas, Monaco, "Courier New", "Lucida Console", Courier, monospace;
    }

    .token {
        flex: 0;
        width: 10rem;
        margin-right: 1rem;
    }
    .amount {
        flex: 1;
    }

    legend {
        display: block;
        font-weight: bold;
        margin: 0 1.5rem;
        height: 2rem;
        line-height: 2rem;
    }

    nav {
        top: .5rem;
        right: 1.5rem;
        position: absolute;
    }
    nav button {
        cursor: pointer;
        display: flex;
        background-color: transparent;
    }
    nav button small {
        display: block;
        margin-right: .4rem;
        color: var(--color-page-text-light);
        font-size: .8rem;
        line-height: 1rem;
        transition: color .25s;
    }
    nav button svg {
        width: auto;
        height: 1rem;
        display: block;
        fill: var(--color-page-text-light);
        transition: fill .25s;
    }
    nav button:hover small {
        color: var(--color-page-text);
    }
    nav button:hover svg {
        fill: var(--color-page-text);
    }

    footer {
        margin-top: 4rem;
        text-align: center;
    }
    footer,
    footer a {
        color: var(--color-page-text-light);
    }

    footer span {
        font-size: .8rem;
        padding: 0 .8rem;
    }
    footer a {
        font-size: 1rem;
    }

    @media (min-width: 624px) {
        main {
            justify-content: center;
            align-items: center;
        }
        form {
            width: 38rem;
            padding: 2rem;
        }
    }
    @media (min-width: 1024px) {
        main {
            flex: 1;
            width: 70%;
            flex-basis: 70%;
        }
        header {
            text-align: left;
            margin-bottom: 6rem;
            padding-left: 1.5rem;
        }

        h3 span {
            display: inline-block;
        }
    }
</style>

<main>
    <form bind:this={form} on:submit|preventDefault={checkout ? zkCheckout : create}>
        <header>
            <h2>
                {#if checkout}
                    Make a payment
                {:else}
                    Create a payment link
                {/if}
            </h2>
            <h3>
                {#if checkout}
                    <span>Fast, secure,</span> ultra-low transaction fee
                {:else}
                    <span>Accepting payments</span> is now just a link away
                {/if}
            </h3>
        </header>

        <fieldset>
            <div class="to">
                <legend>Receiver ETH address</legend>
                <input type="text" name="to" on:input="{update}" value="{to}" readonly="{to}" placeholder="0x" autocapitalize="off" autocorrect="off" spellcheck="false" minlength="42" maxlength="42" required>
            </div>
        </fieldset>

        <fieldset>
            <div class="token">
                <legend>Token</legend>
                <select name="token" disabled="{token}" required="{checkout}" on:change="{update}" on:blur="{update}">
                    <option></option>
                    <option>ETH</option>
                    <option>DAI</option>
                </select>
            </div>
            <div class="amount">
                <legend>Amount</legend>
                <input type="number" name="amount" value="{amount}" readonly="{amount}" required="{checkout}" on:input="{update}" step="any" placeholder="10" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off">
            </div>
        </fieldset>

        <fieldset>
            <div class="submit">
                <button type="submit">
                    {#if checkout}
                        Pay Now
                    {:else}
                        Create your payment link
                    {/if}
                </button>
            </div>
            <div class="textarea is-hidden">
                <legend>Payment link</legend>
                <textarea name="link" value="{link}" readonly></textarea>

                <nav>
                    <button type="button" on:click="{copy}">
                        <small>{copied}</small>
                        <svg height="500" viewBox="0 0 375 500" width="375" xmlns="http://www.w3.org/2000/svg">
                            <g>
                                <path d="m319.808594 33.949219h-80.355469c-9.105469-20.632813-29.535156-33.949219-52.089844-33.949219-22.558593 0-42.988281 13.316406-52.09375 33.949219h-80.359375c-30.3125.035156-54.875 24.601562-54.910156 54.914062v356.222657c.035156 30.3125 24.597656 54.878906 54.910156 54.914062h264.898438c30.3125-.035156 54.878906-24.601562 54.914062-54.914062v-356.222657c-.035156-30.3125-24.601562-54.878906-54.914062-54.914062zm-175.496094 25c5.867188 0 10.945312-4.082031 12.207031-9.820313 3.070313-13.976562 16.042969-24.128906 30.84375-24.128906s27.769531 10.152344 30.839844 24.128906c1.257813 5.738282 6.335937 9.820313 12.210937 9.820313h24.785157v10.96875c-.019531 16.511719-13.398438 29.890625-29.910157 29.910156h-75.855468c-16.515625-.019531-29.894532-13.398437-29.914063-29.910156v-10.96875zm205.410156 386.136719c-.015625 16.515624-13.398437 29.898437-29.914062 29.914062h-264.898438c-16.511718-.015625-29.890625-13.398438-29.910156-29.914062v-356.222657c.019531-16.515625 13.398438-29.894531 29.910156-29.914062h39.609375v10.96875c.035157 30.3125 24.601563 54.875 54.914063 54.910156h75.855468c30.3125-.035156 54.875-24.597656 54.910157-54.910156v-10.96875h39.609375c16.515625.019531 29.894531 13.398437 29.914062 29.914062z"/>
                                <path d="m249.226562 230.957031-82.0625 80.125-41.671874-40.675781c-4.902344-4.796875-12.753907-4.738281-17.59375.121094-4.835938 4.863281-4.855469 12.714844-.039063 17.597656l.167969.164062 50.398437 49.210938c4.859375 4.742188 12.613281 4.742188 17.46875 0l90.792969-88.648438c4.910156-4.828124 4.988281-12.714843.183594-17.640624-4.8125-4.925782-12.695313-5.035157-17.644532-.246094z"/>
                            </g>
                        </svg>
                    </button>
                </nav>
            </div>
        </fieldset>

        <footer>
            <a href="https://zksync.io">Provided by zkSync</a>
            <span>|</span>
            <a href="{HOME_URL}?MHgwNTM1NzY2RTc1RUUwNjAzZjQwZTg1MjBFZUFGQmNFOTQ0QTU3RjcyfHw">Donate to PayNow</a>
        </footer>
    </form>
</main>
