module.exports = {
    apps: [
        {
            name: 'bait-dashboard',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 4000',
            cwd: './',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};