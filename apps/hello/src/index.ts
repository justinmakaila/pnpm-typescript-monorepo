import { greet } from '@workspace/greeting';

const name = process.argv[2] ?? 'world';
console.log(greet({ name }));
