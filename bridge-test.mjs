import { createServer } from 'node:http';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { once } from 'node:events';
import { QqBridge } from './src/qq/bridge.ts';
import { defaultConfig } from './src/qq/config.ts';
import { defaultGroupPolicy } from './src/qq/config.ts';

const root = mkdtempSync(join(tmpdir(), 'qq-bridge-test-'));
const file = readFileSync(process.env.TEMP + '/qq-file-test/test.docx');
const server = createServer((req, res) => { res.writeHead(200, { 'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }); res.end(file); });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const port = server.address().port;
const bridge = new QqBridge({
  config: defaultConfig(),
  userRoot: root,
  persona: () => '',
  log: () => {},
  llm: undefined,
  timeContext: () => '',
  onError: () => {},
  onState: () => {},
});
const policy = defaultGroupPolicy();
const msg = { groupId: 'g', userId: 'u', name: 'u', role: 'member', text: '看看这个文件', atSelf: true, callSelf: false, atAll: false, at: Date.now(), messageId: '1', hasImage: false, images: [], files: [{ type: 'file', data: { name: 'test.docx', url: 'http://127.0.0.1:' + port + '/test.docx' } }], forwards: [], hasVoice: false };
const note = await bridge.readFileContext('g', policy, msg);
console.log(note.slice(0, 300));
bridge.client = { call: async () => ({ status: 'ok', data: { messages: [{ sender: { nickname: 'A' }, message: [{ type: 'text', data: { text: '转发内容' } }] }] } }) };
const fwd = await bridge.readForwardContext(policy, { ...msg, forwards: [{ type: 'forward', data: { id: 'x' } }] });
console.log(fwd.slice(0, 200));
server.close();
rmSync(root, { recursive: true, force: true });
