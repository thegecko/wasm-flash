import del from 'rollup-plugin-delete';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import sourceMaps from 'rollup-plugin-sourcemaps';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const name = 'wasmFlash';
const pkg = require('./package.json')
const watch = process.env.ROLLUP_WATCH;

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'umd',
            sourcemap: true,
            name
        }
    ],
    plugins: [
        !watch && del({
            targets: ['dist/*']
        }),
        typescript({
            useTsconfigDeclarationDir: true
        }),
        terser(),
        sourceMaps(),
        copy({
            targets: [
                { src: 'src/wasm/*.wasm', dest: 'dist' }
            ],
            copyOnce: true
        }),
        watch && serve({
            contentBase: '.',
            open: false,
            openPage: '/index.html',
        }),
        watch && livereload()
    ]
};
