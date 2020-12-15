<script>
    import { HOME_URL, TOKENS_API, TWEET_URL, SHARER_URL } from './Constants'
    import { CheckoutManager } from 'zksync-checkout'
    import { onMount } from 'svelte';

    let form;
    let select;
    let link;
    let tokens;
    let visible;
    let copied = 'copy';

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

        copied = 'copied';

        setTimeout(() => copied = 'copy', 2500);
    }

    const tweet = () => {
        window.open(`${TWEET_URL}${encodeURIComponent(form.link.value)}`, '_blank');
    }

    const share = () => {
        window.open(`${SHARER_URL}${encodeURIComponent(form.link.value)}`, '_blank');
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
        .then(response => response.json())
        .then(items => tokens = items)
        .then(() => tokens.map(item => item.symbol).filter(symbol => !['ETH', 'DAI'].includes(symbol)).forEach(symbol => select.add(new Option(symbol))))
        .then(() => select.value = token)
        .catch(error => console.error('Fetch tokens error:', error));
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
        padding: 1rem;
    }

    header {
        text-align: center;
        margin-bottom: 3rem;
    }
    header article {
        margin: .5rem 0 0;
        pointer-events: none;
    }
    header svg {
        fill: var(--color-page-logo);
        width: 2rem;
        height: 2rem;
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

    select:not([disabled]):hover,
    input:not([readonly]):hover {
        background-color: transparent;
        border-color: var(--color-input-border-hover);
    }

    select[disabled],
    input[readonly] {
        cursor: default;
    }
    select:invalid,
    input:invalid {
        border-color: var(--color-input-border-hover);
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
        display: flex;
    }
    nav button {
        cursor: pointer;
        display: flex;
        align-items: center;
        background-color: transparent;
    }
    nav button + button {
        margin-left: 1rem;
    }
    nav button small {
        display: none;
        margin-right: .4rem;
        color: var(--color-page-text-light);
        font-size: .8rem;
        line-height: 1rem;
        opacity: .6;
        transition: color .25s, opacity .25s;
    }
    nav button svg {
        width: auto;
        height: .9rem;
        display: block;
        fill: var(--color-page-text-light);
        transition: fill .25s;
    }
    nav button:nth-child(2) svg {
        height: 1rem;
    }
    nav button:hover small {
        color: var(--color-page-text);
        opacity: 1;
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
        nav button small {
            display: block;
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
            margin-left: 1.5rem;
            display: flex;
        }
        header svg {
            width: 4rem;
            height: 4rem;
            display: block;
            transition: fill .25s;
        }
        header svg:hover {
            fill: var(--color-page-logo-hover);
        }
        header article {
            margin: 0 0 0 1.5rem;
        }
        header h3 {
            margin-top: .2rem;
        }
    }
</style>

<main>
    <form bind:this={form} on:submit|preventDefault={checkout ? zkCheckout : create}>
        <header>
            <a href="{HOME_URL}" title="PayNow">
                <svg viewBox="0 0 393 392" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <path d="m214.147 207.039c-5.613 19.181-21.23 33.669-40.757 37.813-29.202 6.202-58.008-12.521-64.205-41.727s12.521-58.009 41.727-64.206c8.104-1.719 13.279-9.683 11.56-17.786-1.72-8.104-9.683-13.284-17.787-11.56-45.387 9.631-74.477 54.392-64.846 99.778 8.387 39.525 43.41 66.688 82.293 66.688 5.767 0 11.624-.599 17.486-1.843 30.34-6.437 54.604-28.942 63.322-58.732 2.327-7.95-2.232-16.282-10.184-18.609-7.949-2.321-16.282 2.233-18.609 10.184z"/>
                        <path d="m198.131 125.633c-28.867 11.763-48.867 38.338-52.194 69.355-.883 8.236 5.078 15.63 13.314 16.514 8.238.884 15.631-5.077 16.515-13.314 2.148-20.025 15.056-37.182 33.685-44.771 27.866-11.354 59.771 2.079 71.124 29.943 5.5 13.498 5.414 28.33-.242 41.764-5.655 13.434-16.204 23.86-29.701 29.359-7.672 3.126-11.357 11.88-8.231 19.552 2.371 5.818 7.978 9.344 13.896 9.344 1.885 0 3.802-.357 5.654-1.112 20.919-8.523 37.267-24.684 46.032-45.502 8.765-20.819 8.897-43.806.374-64.725-17.594-43.184-67.04-63.997-110.226-46.407z"/>
                        <path d="m310.724.929h-228.828c-45.158 0-81.896 36.738-81.896 81.896v226.97c0 45.157 36.738 81.896 81.896 81.896h228.828c45.158 0 81.896-36.738 81.896-81.896v-226.97c0-45.158-36.739-81.896-81.896-81.896zm51.896 308.866c0 28.615-23.28 51.896-51.896 51.896h-228.828c-28.616 0-51.896-23.281-51.896-51.896v-226.97c0-28.616 23.28-51.896 51.896-51.896h228.828c28.616 0 51.896 23.28 51.896 51.896z"/>
                    </g>
                </svg>
            </a>

            <article>
                <h2>
                    {#if checkout}
                        Make a payment
                    {:else}
                        Create a payment link
                    {/if}
                </h2>
                <h3>
                    {#if checkout}
                        <span>Fast, secure,</span> ultra-low transaction fees
                    {:else}
                        <span>Accepting payments</span> is just a link away
                    {/if}
                </h3>
            </article>
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
                <select name="token" disabled="{token}" required="{checkout}" on:change="{update}" on:blur="{update}" bind:this={select}>
                    <option></option>
                    <option>ETH</option>
                    <option>DAI</option>
                </select>
            </div>
            <div class="amount">
                <legend>Amount</legend>
                <input type="number" name="amount" value="{amount}" readonly="{amount}" required="{checkout}" on:input="{update}" step="any" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off">
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
                        <svg viewBox="0 0 375 500" xmlns="http://www.w3.org/2000/svg">
                            <g>
                                <path d="m319.808594 33.949219h-80.355469c-9.105469-20.632813-29.535156-33.949219-52.089844-33.949219-22.558593 0-42.988281 13.316406-52.09375 33.949219h-80.359375c-30.3125.035156-54.875 24.601562-54.910156 54.914062v356.222657c.035156 30.3125 24.597656 54.878906 54.910156 54.914062h264.898438c30.3125-.035156 54.878906-24.601562 54.914062-54.914062v-356.222657c-.035156-30.3125-24.601562-54.878906-54.914062-54.914062zm-175.496094 25c5.867188 0 10.945312-4.082031 12.207031-9.820313 3.070313-13.976562 16.042969-24.128906 30.84375-24.128906s27.769531 10.152344 30.839844 24.128906c1.257813 5.738282 6.335937 9.820313 12.210937 9.820313h24.785157v10.96875c-.019531 16.511719-13.398438 29.890625-29.910157 29.910156h-75.855468c-16.515625-.019531-29.894532-13.398437-29.914063-29.910156v-10.96875zm205.410156 386.136719c-.015625 16.515624-13.398437 29.898437-29.914062 29.914062h-264.898438c-16.511718-.015625-29.890625-13.398438-29.910156-29.914062v-356.222657c.019531-16.515625 13.398438-29.894531 29.910156-29.914062h39.609375v10.96875c.035157 30.3125 24.601563 54.875 54.914063 54.910156h75.855468c30.3125-.035156 54.875-24.597656 54.910157-54.910156v-10.96875h39.609375c16.515625.019531 29.894531 13.398437 29.914062 29.914062z"/>
                                <path d="m249.226562 230.957031-82.0625 80.125-41.671874-40.675781c-4.902344-4.796875-12.753907-4.738281-17.59375.121094-4.835938 4.863281-4.855469 12.714844-.039063 17.597656l.167969.164062 50.398437 49.210938c4.859375 4.742188 12.613281 4.742188 17.46875 0l90.792969-88.648438c4.910156-4.828124 4.988281-12.714843.183594-17.640624-4.8125-4.925782-12.695313-5.035157-17.644532-.246094z"/>
                            </g>
                        </svg>
                    </button>

                    <button type="button" on:click="{tweet}">
                        <small>tweet</small>
                        <svg viewBox="0 -47 512.00004 512" xmlns="http://www.w3.org/2000/svg">
                            <path d="m512 55.964844c-32.207031 1.484375-31.503906 1.363281-35.144531 1.667968l19.074219-54.472656s-59.539063 21.902344-74.632813 25.820313c-39.640625-35.628907-98.5625-37.203125-140.6875-11.3125-34.496094 21.207031-53.011719 57.625-46.835937 100.191406-67.136719-9.316406-123.703126-41.140625-168.363282-94.789063l-14.125-16.964843-10.554687 19.382812c-13.339844 24.492188-17.769531 52.496094-12.476563 78.851563 2.171875 10.8125 5.863282 21.125 10.976563 30.78125l-12.117188-4.695313-1.4375 20.246094c-1.457031 20.566406 5.390625 44.574219 18.320313 64.214844 3.640625 5.53125 8.328125 11.605469 14.269531 17.597656l-6.261719-.960937 7.640625 23.199218c10.042969 30.480469 30.902344 54.0625 57.972657 67.171875-27.035157 11.472657-48.875 18.792969-84.773438 30.601563l-32.84375 10.796875 30.335938 16.585937c11.566406 6.324219 52.4375 27.445313 92.820312 33.78125 89.765625 14.078125 190.832031 2.613282 258.871094-58.664062 57.308594-51.613282 76.113281-125.03125 72.207031-201.433594-.589844-11.566406 2.578125-22.605469 8.921875-31.078125 12.707031-16.964844 48.765625-66.40625 48.84375-66.519531zm-72.832031 48.550781c-10.535157 14.066406-15.8125 32.03125-14.867188 50.578125 3.941407 77.066406-17.027343 136.832031-62.328125 177.628906-52.917968 47.660156-138.273437 66.367188-234.171875 51.324219-17.367187-2.722656-35.316406-8.820313-50.171875-14.910156 30.097656-10.355469 53.339844-19.585938 90.875-37.351563l52.398438-24.800781-57.851563-3.703125c-27.710937-1.773438-50.785156-15.203125-64.96875-37.007812 7.53125-.4375 14.792969-1.65625 22.023438-3.671876l55.175781-15.367187-55.636719-13.625c-27.035156-6.621094-42.445312-22.796875-50.613281-35.203125-5.363281-8.152344-8.867188-16.503906-10.96875-24.203125 5.578125 1.496094 12.082031 2.5625 22.570312 3.601563l51.496094 5.09375-40.800781-31.828126c-29.398437-22.929687-41.179687-57.378906-32.542969-90.496093 91.75 95.164062 199.476563 88.011719 210.320313 90.527343-2.386719-23.183593-2.449219-23.238281-3.074219-25.445312-13.886719-49.089844 16.546875-74.015625 30.273438-82.453125 28.671874-17.621094 74.183593-20.277344 105.707031 8.753906 6.808593 6.265625 16.015625 8.730469 24.632812 6.589844 7.734375-1.921875 14.082031-3.957031 20.296875-6.171875l-12.9375 36.945312 16.515625.011719c-3.117187 4.179688-6.855469 9.183594-11.351562 15.183594zm0 0"/>
                        </svg>
                    </button>

                    <button type="button" on:click="{share}">
                        <small>share</small>
                        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                            <path d="m75 512h167v-182h-60v-60h60v-75c0-41.355469 33.644531-75 75-75h75v60h-60c-16.542969 0-30 13.457031-30 30v60h87.292969l-10 60h-77.292969v182h135c41.355469 0 75-33.644531 75-75v-362c0-41.355469-33.644531-75-75-75h-362c-41.355469 0-75 33.644531-75 75v362c0 41.355469 33.644531 75 75 75zm-45-437c0-24.8125 20.1875-45 45-45h362c24.8125 0 45 20.1875 45 45v362c0 24.8125-20.1875 45-45 45h-105v-122h72.707031l20-120h-92.707031v-30h90v-120h-105c-57.898438 0-105 47.101562-105 105v45h-60v120h60v122h-137c-24.8125 0-45-20.1875-45-45zm0 0"/>
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
