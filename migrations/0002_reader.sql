-- Reader Dashboard tables: bookmarks, reading history, follows

CREATE TABLE IF NOT EXISTS bookmark (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id),
  storyId TEXT NOT NULL,
  storySlug TEXT NOT NULL,
  storyTitle TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(userId, storyId)
);

CREATE TABLE IF NOT EXISTS reading_history (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id),
  storyId TEXT NOT NULL,
  storySlug TEXT NOT NULL,
  storyTitle TEXT NOT NULL,
  progress REAL NOT NULL DEFAULT 0,
  lastReadAt TEXT NOT NULL DEFAULT (datetime('now')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(userId, storyId)
);

CREATE TABLE IF NOT EXISTS follows (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id),
  entityId TEXT,
  entityType TEXT,
  entitySlug TEXT,
  entityName TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(userId, entityId)
);

CREATE INDEX IF NOT EXISTS idx_bookmark_userId ON bookmark(userId);
CREATE INDEX IF NOT EXISTS idx_reading_history_userId ON reading_history(userId);
CREATE INDEX IF NOT EXISTS idx_reading_history_lastRead ON reading_history(userId, lastReadAt DESC);
CREATE INDEX IF NOT EXISTS idx_follows_userId ON follows(userId);
