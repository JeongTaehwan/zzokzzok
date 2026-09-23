// 테스트 계획 2.1 — 문구 규칙 (FR-06, FR-01)
import { hasBatchim, vocative, alarmMessage, possessive, DEFAULT_BABY_NAME } from './korean';

describe('hasBatchim', () => {
  it('TC-K01 받침 있는 글자', () => expect(hasBatchim('민')).toBe(true));
  it('TC-K02 받침 없는 글자', () => expect(hasBatchim('아')).toBe(false));
  it('TC-K03 ㄹ 받침', () => expect(hasBatchim('율')).toBe(true));
  it('TC-K04 한글이 아니면 false', () => {
    expect(hasBatchim('y')).toBe(false);
    expect(hasBatchim('')).toBe(false);
    expect(hasBatchim('1')).toBe(false);
  });
  it('문자열이면 마지막 글자로 판단', () => {
    expect(hasBatchim('지민')).toBe(true);
    expect(hasBatchim('수아')).toBe(false);
  });
});

describe('vocative (호격 조사 아/야)', () => {
  it('TC-K05 받침 있으면 아', () => expect(vocative('지민')).toBe('지민아'));
  it('TC-K06 받침 없으면 야', () => expect(vocative('수아')).toBe('수아야'));
  it('TC-K07 한글이 아니면 아', () => expect(vocative('Lily')).toBe('Lily아'));
  it('앞뒤 공백 제거', () => expect(vocative('  하율  ')).toBe('하율아'));
});

describe('possessive (이/∅ + 의)', () => {
  it('받침 있으면 이', () => expect(possessive('지민')).toBe('지민이'));
  it('받침 없으면 그대로', () => expect(possessive('수아')).toBe('수아'));
});

describe('alarmMessage', () => {
  it('TC-K08 이름 포함 문구', () => expect(alarmMessage('지민')).toBe('지민아~ 맘마먹자'));
  it('받침 없는 이름', () => expect(alarmMessage('수아')).toBe('수아야~ 맘마먹자'));
  it('TC-K09 이름이 비면 아가야', () => {
    expect(alarmMessage('')).toBe('아가야~ 맘마먹자');
    expect(alarmMessage('   ')).toBe('아가야~ 맘마먹자');
    expect(DEFAULT_BABY_NAME).toBe('아가');
  });
  it('TC-K10 앞뒤 공백 제거', () => expect(alarmMessage('  하율  ')).toBe('하율아~ 맘마먹자'));
});
