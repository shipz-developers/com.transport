export const sid = {
    _counter: Math.floor(Math.random() * 1000),

    _words: [
        'alpha', 'nexus', 'ghost', 'pixel', 'vortex', 'cipher', 'echo', 'iron',
        'solar', 'omega', 'zenith', 'flame', 'storm', 'frost', 'neon', 'vector',
        'hazard', 'comet', 'pulse', 'quantum', 'titan', 'relic', 'logic', 'plasma'
    ],

    GenerateSID: function () {
        this._counter += Math.floor(Math.random() * 10) + 1;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        let noise = '';
        for (let i = 0; i < 8; i++) {
            noise += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const time = Date.now().toString(36).split('').reverse().join('');
        const count = (this._counter * 16807).toString(36);

        const parts = [time, noise, count, this._words[Math.floor(Math.random() * this._words.length)]];

        if (this._counter % 2 === 0) {
            return `sid_${parts[3]}_${parts[1]}${parts[0]}${parts[2]}`;
        } else {
            return `sid_${parts[2]}${parts[1]}_${parts[3]}_${parts[0]}`;
        }
    }
};