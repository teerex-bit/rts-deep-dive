import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const fruit = read('public/become/fruit/index.html');
const becomePages = [
  read('public/become/index.html'), read('public/become/live-with-god/index.html'),
  read('public/become/practice-forms-the-person/index.html'), read('public/become/whole-person/index.html'),
];
const joinIntro = read('public/join/index.html');
const doorway = read('public/index.html');
const review = read('public/review/index.html');

assert.match(fruit, /href="\/join\/"/, 'Become Fruit advances to Join');
assert.match(fruit, />NEXT[\s\S]*?→<\/span><\/a>/, 'Fruit uses the standard forward action label');
for (const page of becomePages) assert.match(page, />NEXT[\s\S]*?→<\/span><\/a>/, 'Become forward navigation uses the standard action label');
assert.match(joinIntro, /href="\/join\/useful\/">NEXT[\s\S]*?→<\/span><\/a>/, 'Join forward navigation uses the standard action label');

assert.match(doorway, /Movement 04 · Join/, 'doorway labels movement four');
assert.match(doorway, /href="\/join\/"/, 'doorway lists Join introduction');
assert.match(doorway, /href="\/join\/useful\/"/, 'doorway lists Join conclusion');
assert.ok(doorway.indexOf('href="/join/"') < doorway.indexOf('href="/join/useful/"'), 'doorway preserves Join order');

assert.match(review, /class="page-card" data-url="\/join\/"/, 'review enables Join page one');
assert.match(review, /class="page-card" data-url="\/join\/useful\/"/, 'review enables Join page two');
assert.doesNotMatch(review, /disabled><b>08<\/b><span>Join 1/, 'Join page one is no longer disabled');
assert.doesNotMatch(review, /disabled><b>09<\/b><span>Join 2/, 'Join page two is no longer disabled');
