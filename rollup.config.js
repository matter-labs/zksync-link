import svelte from 'rollup-plugin-svelte';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import builtins from 'rollup-plugin-node-builtins';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-asset';

const production = !process.env.ROLLUP_WATCH;

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                stdio: ['ignore', 'inherit', 'inherit'],
                shell: true
            });

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        }
    };
}

export default {
    input: 'src/app.js',
    output: {
        sourcemap: !production,
        format: 'iife',
        name: 'app',
        dir: 'public',
        assetFileNames: 'styles/bundle.css',
        entryFileNames: 'scripts/bundle.js',
        inlineDynamicImports: true,
    },
    plugins: [
        json(),
        svelte({
            dev: !production,
            emitCss: true,
        }),

        css({
            name: 'bundle',
        }),

        resolve({
            browser: true,
            preferBuiltins: false,
            dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
        }),
        commonjs(),
        builtins(),

        !production && serve(),
        !production && livereload('public'),

        production && terser()
    ],
    watch: {
        clearScreen: false
    },
    moduleContext: (id) => {
        const thisAsWindowForModules = [
            'node_modules/@ethersproject/web/lib.esm/geturl.js',
            'node_modules/@ethersproject/hash/lib.esm/typed-data.js',
            'node_modules/@ethersproject/json-wallets/lib.esm/keystore.js',
            'node_modules/@ethersproject/providers/lib.esm/websocket-provider.js',
            'node_modules/@ethersproject/web/lib.esm/index.js',
            'node_modules/@ethersproject/providers/lib.esm/url-json-rpc-provider.js',
            'node_modules/@ethersproject/providers/lib.esm/json-rpc-provider.js',
            'node_modules/@ethersproject/providers/lib.esm/cloudflare-provider.js',
            'node_modules/@ethersproject/providers/lib.esm/fallback-provider.js',
            'node_modules/@ethersproject/providers/lib.esm/etherscan-provider.js',
            'node_modules/@ethersproject/wallet/lib.esm/index.js',
            'node_modules/@ethersproject/abstract-signer/lib.esm/index.js',
            'node_modules/@ethersproject/contracts/lib.esm/index.js',
            'node_modules/@ethersproject/properties/lib.esm/index.js',
            'node_modules/@ethersproject/providers/lib.esm/base-provider.js',
        ];

        if (thisAsWindowForModules.some(id_ => id.trimRight().endsWith(id_))) {
            return 'window';
        }
    }
};
