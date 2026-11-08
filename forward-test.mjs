import { readForward } from './src/qq/forward.ts';

const client = {
  async call(action, params) {
    console.log('call', action, params.id);
    return {
      status: 'ok',
      retcode: 0,
      data: {
        messages: [
          { sender: { nickname: 'A' }, message: [{ type: 'text', data: { text: '第一句' } }] },
          { sender: { card: 'B' }, message: [{ type: 'text', data: { text: '第二句' } }, { type: 'image', data: {} }] },
          { sender: { nickname: 'C' }, message: [{ type: 'forward', data: {} }] },
        ],
      },
    };
  },
};
const result = await readForward(client, { type: 'forward', data: { id: 'x' } }, 2, 1000);
console.log(result);
