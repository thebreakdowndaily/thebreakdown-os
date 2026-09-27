import { getPublicStories, getStories, getTopics, getEntities } from '../utils/data-layer/store';

const allStories = getStories({ pageSize: 1000 }).data;
const pubStories = getPublicStories({ pageSize: 1000 }).data;
const topics = getTopics({ pageSize: 1000 }).data;
const entities = getEntities({ pageSize: 1000 }).data;

console.log('PUBLIC_STORIES:', pubStories.length);
console.log('ALL_STORIES:', allStories.length);
console.log('TOPICS:', topics.length);
console.log('ENTITIES:', Object.keys(entities).length);
