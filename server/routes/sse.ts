import { Readable } from 'node:stream';
async function* counter(num = 10000) {
    for (let i = 0; i < num; i++) {
        await sleep(1000);
        yield `event: message\ndata: ${i}\nid: ${i}\n\n`;
    }
    return 'success';
}

function sleep(time = 1000) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export default eventHandler((event) => {
    setResponseHeader(event, 'Content-Type', 'text/event-stream;charset=utf-8');
    setResponseHeader(event, 'Cache-Control', 'no-cache');
    setResponseHeader(event, 'Connection', 'keep-alive');
    setResponseHeader(event, 'Transfer-Encoding', 'chunked');
    return new Promise((resolve, reject) => {
        const counterStream = Readable.from(counter(100));
        sendStream(event, counterStream);
        counterStream.on('end', () => {
            console.log('counterStream end');
            resolve('success');
        });
        counterStream.on('error', (e) => {
            console.log('counterStream error');
            reject(e);
        });
        event.node.req.on('close', () => {
            console.log('connection closed');
            resolve('success');
        });
    });
});
