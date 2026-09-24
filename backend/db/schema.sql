CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(60) NOT NULL,
  email VARCHAR(160) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  last_activity_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider TEXT,
  provider_id TEXT
);

CREATE TABLE IF NOT EXISTS phases (
  id SERIAL PRIMARY KEY,
  phase_number INTEGER NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(20) NOT NULL DEFAULT '◈'
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS missions (
  id SERIAL PRIMARY KEY,
  phase_id INTEGER REFERENCES phases(id) ON DELETE SET NULL,
  skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner',
  estimated_minutes INTEGER NOT NULL DEFAULT 15 CHECK (estimated_minutes > 0),
  xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward > 0),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS mission_progress (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started',
  completed_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, mission_id)
);

CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(20) NOT NULL DEFAULT '🏆'
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_provider_identity_idx ON users (provider, provider_id) WHERE provider IS NOT NULL AND provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS mission_progress_user_idx ON mission_progress (user_id);
CREATE INDEX IF NOT EXISTS missions_phase_idx ON missions (phase_id);

INSERT INTO phases (phase_number, name, description, icon) VALUES
(1, 'Foundations', 'Understand computers, the internet, operating systems, and security basics.', '🌱'),
(2, 'Networking', 'Learn how devices communicate and how network traffic moves.', '🌐'),
(3, 'Systems', 'Build Linux, Windows, processes, shells, and programming fundamentals.', '🐧'),
(4, 'Security Core', 'Learn authentication, cryptography, vulnerabilities, and defensive concepts.', '🔐'),
(5, 'Web Security', 'Understand web applications, APIs, sessions, and common vulnerabilities.', '🌍'),
(6, 'Offensive Security', 'Practice ethical security testing in authorized labs and CTF environments.', '⚔️'),
(7, 'Blue Team', 'Learn monitoring, detection, incident response, and threat hunting.', '🛡️'),
(8, 'Cloud Security', 'Understand cloud identity, networking, workloads, and security controls.', '☁️')
ON CONFLICT (phase_number) DO NOTHING;

INSERT INTO skills (name, description) VALUES
('Computer Foundations', 'Core computer and operating-system knowledge.'),
('Networking', 'Protocols, addressing, routing, DNS, HTTP, and packet analysis.'),
('Linux', 'Linux command line, permissions, processes, and system administration.'),
('Python', 'Python programming for automation and security tooling.'),
('Security Core', 'Security principles, authentication, cryptography, and vulnerabilities.'),
('Web Security', 'Web applications, APIs, sessions, and secure development.'),
('Offensive Security', 'Authorized penetration testing and security assessment skills.'),
('Blue Team', 'Security monitoring, detection, response, and threat hunting.'),
('Cloud Security', 'Cloud identity, networking, workloads, and security architecture.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO missions (phase_id, skill_id, title, description, difficulty, estimated_minutes, xp_reward, sort_order)
SELECT p.id, s.id, 'Packet Detective', 'Learn how packets move through a network and identify the role of common protocols in a safe simulated exercise.', 'beginner', 15, 100, 1
FROM phases p CROSS JOIN skills s
WHERE p.phase_number = 2 AND s.name = 'Networking'
AND NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Packet Detective');

INSERT INTO missions (phase_id, skill_id, title, description, difficulty, estimated_minutes, xp_reward, sort_order)
SELECT p.id, s.id, 'Linux Explorer', 'Practice navigating a Linux filesystem, reading permissions, and understanding common command-line operations.', 'beginner', 15, 100, 2
FROM phases p CROSS JOIN skills s
WHERE p.phase_number = 3 AND s.name = 'Linux'
AND NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Linux Explorer');

INSERT INTO missions (phase_id, skill_id, title, description, difficulty, estimated_minutes, xp_reward, sort_order)
SELECT p.id, s.id, 'HTTP Detective', 'Inspect a simulated web request and identify methods, headers, status codes, and the role of cookies.', 'beginner', 20, 125, 3
FROM phases p CROSS JOIN skills s
WHERE p.phase_number = 5 AND s.name = 'Web Security'
AND NOT EXISTS (SELECT 1 FROM missions WHERE title = 'HTTP Detective');

INSERT INTO badges (name, description, icon) VALUES
('First Mission', 'Complete your first CyberQuest mission.', '🎯'),
('Networking Starter', 'Complete your first networking mission.', '🌐'),
('Linux Starter', 'Complete your first Linux mission.', '🐧'),
('Seven Day Streak', 'Maintain activity for seven consecutive days.', '🔥')
ON CONFLICT (name) DO NOTHING;


CREATE TABLE IF NOT EXISTS mission_challenges (
  id SERIAL PRIMARY KEY,
  mission_id INTEGER UNIQUE NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  learn_content TEXT NOT NULL,
  practice_content TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL
);

INSERT INTO mission_challenges (mission_id, learn_content, practice_content, question, options, correct_answer, explanation)
SELECT m.id,
  'A hostname such as example.com must be translated into an IP address before a device can connect. DNS performs that name-resolution job. In this mission, the packet data is simulated so you can focus on recognizing protocol roles.',
  'Simulated packet: Source 10.0.0.12 → Destination 10.0.0.1 | Protocol: DNS | Query: example.com | Type: A',
  'Which protocol is used to resolve a hostname to an IP address?',
  '["HTTP","DNS","SSH","TLS"]'::jsonb,
  'DNS',
  'DNS is the protocol used for translating domain names into IP addresses.'
FROM missions m
WHERE m.title = 'Packet Detective'
ON CONFLICT (mission_id) DO NOTHING;

INSERT INTO mission_challenges (mission_id, learn_content, practice_content, question, options, correct_answer, explanation)
SELECT m.id,
  'Linux permissions describe who can read, write, or execute a file. The three permission groups are owner, group, and others. A permission string rw-r----- gives read/write to the owner and read-only access to the group.',
  'Simulated file: /home/student/notes.txt | Permissions: rw-r----- | Owner: student | Group: analysts',
  'Who can read this file with permissions rw-r-----?',
  '["Owner and group","Everyone","Only owner","Nobody"]'::jsonb,
  'Owner and group',
  'The owner has r, and the group also has r. Others have no permissions.'
FROM missions m
WHERE m.title = 'Linux Explorer'
ON CONFLICT (mission_id) DO NOTHING;

INSERT INTO mission_challenges (mission_id, learn_content, practice_content, question, options, correct_answer, explanation)
SELECT m.id,
  'HTTP methods describe what a client wants to do with a resource. GET is commonly used to retrieve a resource, while POST usually sends data to create or trigger a server-side action. This exercise uses a simulated request.',
  'Simulated request: GET /dashboard HTTP/1.1 | Host: training.cyberquest.local | Cookie: session=simulated',
  'Which HTTP method is commonly used to retrieve a resource without changing server state?',
  '["GET","POST","PUT","DELETE"]'::jsonb,
  'GET',
  'GET is designed for retrieving a representation of a resource and is intended to be safe to repeat.'
FROM missions m
WHERE m.title = 'HTTP Detective'
ON CONFLICT (mission_id) DO NOTHING;
