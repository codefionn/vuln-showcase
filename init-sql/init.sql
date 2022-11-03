CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS confirmations;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
  id SERIAL,
  email VARCHAR(320) NOT NULL,
  firstname VARCHAR(256) NOT NULL,
  surname VARCHAR(256) NOT NULL,
  hashed_password VARCHAR(256) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY(id)
);

-- Create users with password test
INSERT INTO users (email, firstname, surname, hashed_password, is_active) VALUES
  ('john.doe@mailer', 'John', 'Doe', 'ZeSFKSrovBbL51h2Ty_Rr3YUbkp7gHTxc8y1UA5JEmY', TRUE),
  ('jane.doe@mailer', 'Jane', 'Doe', 'ZeSFKSrovBbL51h2Ty_Rr3YUbkp7gHTxc8y1UA5JEmY', TRUE);

CREATE UNIQUE INDEX users_email_idx ON users(email);

CREATE TABLE posts(
  id SERIAL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY(id),
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX posts_search_idx ON posts(title, content, is_private);
CREATE INDEX posts_user_id_idx ON posts(user_id);

INSERT INTO posts (title, content, user_id, is_private) VALUES
  ('test (1)', 'test content of John Doe (1)', 1, FALSE),
  ('test (2)', 'test content of Jane Doe (2)', 2, FALSE),
  ('private test (3)', 'private test content of John Doe (3)', 1, TRUE),
  ('private test (4)', 'private test content of Jane Doe (4)', 2, TRUE);

CREATE TABLE confirmations(
  id SERIAL,
  confirm_key uuid NOT NULL DEFAULT uuid_generate_v4(),
  subject_name VARCHAR(128) NOT NULL,
  subject_id INTEGER NOT NULL,
  PRIMARY KEY(id)
);


CREATE UNIQUE INDEX confirmations_confirm_key_idx ON confirmations(subject_name, confirm_key);