import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const emptyStore = () => ({ version: 1, groups: {} });
export function readPermanentStore(path) {
    try {
        if (!existsSync(path))
            return emptyStore();
        const parsed = JSON.parse(readFileSync(path, 'utf8'));
        const groups = {};
        if (parsed.groups !== null && typeof parsed.groups === 'object') {
            for (const [groupId, raw] of Object.entries(parsed.groups)) {
                if (raw === null || typeof raw !== 'object')
                    continue;
                const block = raw;
                const items = Array.isArray(block.items)
                    ? block.items
                        .map((value) => {
                        if (value === null || typeof value !== 'object')
                            return undefined;
                        const item = value;
                        if (typeof item.text !== 'string' || item.text.trim() === '')
                            return undefined;
                        return {
                            id: typeof item.id === 'string' && item.id !== ''
                                ? item.id
                                : `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                            text: item.text.trim().slice(0, 4000),
                            people: Array.isArray(item.people)
                                ? item.people.filter((x) => typeof x === 'string').slice(0, 20)
                                : [],
                            createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
                            updatedAt: typeof item.updatedAt === 'number'
                                ? item.updatedAt
                                : typeof item.createdAt === 'number'
                                    ? item.createdAt
                                    : Date.now(),
                            source: item.source === 'manual' || item.source === 'merge' || item.source === 'auto'
                                ? item.source
                                : 'manual',
                        };
                    })
                        .filter((item) => item !== undefined)
                    : [];
                groups[groupId] = {
                    items,
                    ...(typeof block.sealedAt === 'number' ? { sealedAt: block.sealedAt } : {}),
                    ...(typeof block.updatedAt === 'number' ? { updatedAt: block.updatedAt } : {}),
                };
            }
        }
        return { version: 1, groups };
    }
    catch {
        return emptyStore();
    }
}
export function writePermanentStore(path, store) {
    writeFileSync(path, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}
function groupOf(store, groupId) {
    const group = (store.groups[groupId] ??= { items: [] });
    if (!Array.isArray(group.items))
        group.items = [];
    return group;
}
export function listPermanent(store, groupId) {
    return groupOf(store, groupId).items.slice();
}
export function addPermanent(store, groupId, input, capacity, now = Date.now()) {
    const text = String(input.text ?? '').trim().slice(0, 4000);
    if (text === '')
        return { ok: false, reason: 'empty' };
    const group = groupOf(store, groupId);
    const people = (input.people ?? []).filter((x) => typeof x === 'string' && x !== '').slice(0, 20);
    const source = input.source ?? 'manual';
    const cap = Math.max(0, Math.round(capacity));
    const mergeWithinMs = Math.max(0, input.mergeWithinMs ?? 0);
    const last = group.items[group.items.length - 1];
    // 同一人短时间内的连续消息合并，不占新条目。
    if (mergeWithinMs > 0 &&
        source === 'auto' &&
        last !== undefined &&
        now - last.updatedAt <= mergeWithinMs &&
        last.people.join(',') === people.join(',') &&
        last.text.length + text.length + 1 <= 1800) {
        last.text = `${last.text}\n${text}`;
        last.updatedAt = now;
        group.updatedAt = now;
        return { ok: true, item: last, merged: true };
    }
    if (cap > 0 && group.items.length >= cap) {
        group.sealedAt = now;
        group.updatedAt = now;
        return { ok: false, reason: 'full', capacity: cap };
    }
    const item = {
        id: `p-${now.toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        people,
        createdAt: now,
        updatedAt: now,
        source,
    };
    group.items.push(item);
    delete group.sealedAt;
    group.updatedAt = now;
    return { ok: true, item, merged: false };
}
export function deletePermanent(store, groupId, id) {
    const group = groupOf(store, groupId);
    const index = group.items.findIndex((item) => item.id === id);
    if (index < 0)
        return false;
    group.items.splice(index, 1);
    group.updatedAt = Date.now();
    if (group.items.length === 0)
        delete group.sealedAt;
    return true;
}
/** 把多条永久记忆替换成一条合并结果（AI 合并/人工整理）。 */
export function replacePermanent(store, groupId, ids, text) {
    const group = groupOf(store, groupId);
    const wanted = new Set(ids);
    const selected = group.items.filter((item) => wanted.has(item.id));
    if (selected.length === 0)
        return undefined;
    const mergedText = String(text ?? '').trim().slice(0, 4000);
    if (mergedText === '')
        return undefined;
    const people = Array.from(new Set(selected.flatMap((item) => item.people))).slice(0, 20);
    const now = Date.now();
    const item = {
        id: `p-${now.toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        text: mergedText,
        people,
        createdAt: Math.min(...selected.map((entry) => entry.createdAt)),
        updatedAt: now,
        source: 'merge',
    };
    group.items = group.items.filter((entry) => !wanted.has(entry.id));
    group.items.push(item);
    group.updatedAt = now;
    delete group.sealedAt;
    return item;
}
/** 简单相关度：关键词命中 + 新近程度；不做时间衰减删除。 */
export function selectPermanent(entries, query, limit, maxChars) {
    const q = query.toLowerCase().replace(/\s+/g, '');
    const scored = entries.map((item, index) => {
        const text = item.text.toLowerCase();
        let score = index * 0.001; // 旧的稍微降权，但不会消失
        if (q !== '') {
            const grams = new Set();
            for (let i = 0; i + 1 < q.length && grams.size < 40; i += 1)
                grams.add(q.slice(i, i + 2));
            for (const gram of grams)
                if (text.includes(gram))
                    score += 2;
            if (q.includes('主人') && item.people.length > 0)
                score += 1;
        }
        return { item, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const picked = [];
    let chars = 0;
    for (const { item } of scored) {
        if (picked.length >= Math.max(1, limit))
            break;
        if (chars + item.text.length > Math.max(200, maxChars) && picked.length > 0)
            continue;
        picked.push(item);
        chars += item.text.length;
    }
    return picked;
}
