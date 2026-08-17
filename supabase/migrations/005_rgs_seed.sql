-- ============================================================
-- RGS Seed Data — Royal Global School
-- School ID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
-- ============================================================
-- Safe to run multiple times. Skips if data already exists.
-- ============================================================

DO $$
DECLARE
  rgs_school_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  tracker_id uuid;
  cls_id uuid;
BEGIN
  -- Check if tracker already exists
  SELECT id INTO tracker_id FROM trackers WHERE school_id = rgs_school_id AND name = 'Session 2026-27';

  IF tracker_id IS NOT NULL THEN
    RAISE NOTICE 'RGS tracker already exists (id: %). Skipping seed.', tracker_id;
    RETURN;
  END IF;

  -- Create tracker
  INSERT INTO trackers (school_id, name, subtitle, note_banner)
  VALUES (
    rgs_school_id,
    'Session 2026-27',
    'Half Yearly Examination · Grade III to XII · Royal Global School, Guwahati',
    'Data checked against the official Term-I datesheet. Grades III–V track only the Question Paper (no Blueprint/Marking Scheme). Grades VI–VIII split 2nd Language and 3rd Language into separate papers; Grades IX–X split 2nd Language and Painting into separate papers. Grade III-A and V-A are the Cambridge stream.'
  )
  RETURNING id INTO tracker_id;

  -- Create classes (grades)
  INSERT INTO classes (tracker_id, label, track_items, sort_order) VALUES
    (tracker_id, 'Grade III',              '["qp","edited","proofread","corrected","final"]', 1),
    (tracker_id, 'Grade III-A (Cambridge)','["qp","edited","proofread","corrected","final"]', 2),
    (tracker_id, 'Grade IV',              '["qp","edited","proofread","corrected","final"]', 3),
    (tracker_id, 'Grade V',               '["qp","edited","proofread","corrected","final"]', 4),
    (tracker_id, 'Grade V-A (Cambridge)', '["qp","edited","proofread","corrected","final"]', 5),
    (tracker_id, 'Grade VI',              '["qp","bp","ms","edited","proofread","corrected","final"]', 6),
    (tracker_id, 'Grade VII',             '["qp","bp","ms","edited","proofread","corrected","final"]', 7),
    (tracker_id, 'Grade VIII',            '["qp","bp","ms","edited","proofread","corrected","final"]', 8),
    (tracker_id, 'Grade IX',              '["qp","bp","ms","edited","proofread","corrected","final"]', 9),
    (tracker_id, 'Grade X',               '["qp","bp","ms","edited","proofread","corrected","final"]', 10),
    (tracker_id, 'Grade XI',              '["qp","bp","ms","edited","proofread","corrected","final"]', 11),
    (tracker_id, 'Grade XII',             '["qp","bp","ms","edited","proofread","corrected","final"]', 12);

  -- Create exam dates
  INSERT INTO exam_dates (tracker_id, date, day) VALUES
    (tracker_id, '2026-09-08', 'Tuesday'),
    (tracker_id, '2026-09-09', 'Wednesday'),
    (tracker_id, '2026-09-10', 'Thursday'),
    (tracker_id, '2026-09-11', 'Friday'),
    (tracker_id, '2026-09-14', 'Monday'),
    (tracker_id, '2026-09-15', 'Tuesday'),
    (tracker_id, '2026-09-16', 'Wednesday'),
    (tracker_id, '2026-09-18', 'Friday');

  -- ============================================================
  -- Grade III subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade III';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'English Literature', 'Language',      '2026-09-08', 1),
    (cls_id, 'Hindi',              'Language',      '2026-09-09', 2),
    (cls_id, 'EVS',                'Main Subject',  '2026-09-10', 3),
    (cls_id, 'Assamese',           'Language',      '2026-09-11', 4),
    (cls_id, 'Sanskrit',           'Language',      '2026-09-11', 5),
    (cls_id, 'Mathematics',        'Main Subject',  '2026-09-14', 6),
    (cls_id, 'Computer',           'Skill',         '2026-09-15', 7),
    (cls_id, 'English Language',   'Language',      '2026-09-16', 8),
    (cls_id, 'GK',                 'Elective',      '2026-09-18', 9);

  -- ============================================================
  -- Grade III-A (Cambridge) subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade III-A (Cambridge)';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'English Literature', 'Language',      '2026-09-08', 1),
    (cls_id, 'Hindi',              'Language',      '2026-09-09', 2),
    (cls_id, 'Science',            'Main Subject',  '2026-09-10', 3),
    (cls_id, 'Assamese',           'Language',      '2026-09-11', 4),
    (cls_id, 'French',             'Language',      '2026-09-11', 5),
    (cls_id, 'Mathematics',        'Main Subject',  '2026-09-14', 6),
    (cls_id, 'Computer Science',   'Skill',         '2026-09-15', 7),
    (cls_id, 'English Language',   'Language',      '2026-09-16', 8),
    (cls_id, 'GK',                 'Elective',      '2026-09-18', 9);

  -- ============================================================
  -- Grade IV subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade IV';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Mathematics',        'Main Subject',  '2026-09-08', 1),
    (cls_id, 'Computer',           'Skill',         '2026-09-09', 2),
    (cls_id, 'GK',                 'Elective',      '2026-09-09', 3),
    (cls_id, 'Science',            'Main Subject',  '2026-09-10', 4),
    (cls_id, 'English Language',   'Language',      '2026-09-11', 5),
    (cls_id, 'Social Studies',     'Main Subject',  '2026-09-14', 6),
    (cls_id, 'English Literature', 'Language',      '2026-09-15', 7),
    (cls_id, 'Hindi',              'Language',      '2026-09-16', 8),
    (cls_id, 'Assamese',           'Language',      '2026-09-18', 9),
    (cls_id, 'Sanskrit',           'Language',      '2026-09-18', 10);

  -- ============================================================
  -- Grade V subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade V';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Social Studies',     'Main Subject',  '2026-09-08', 1),
    (cls_id, 'Computer',           'Skill',         '2026-09-09', 2),
    (cls_id, 'GK',                 'Elective',      '2026-09-09', 3),
    (cls_id, 'English Language',   'Language',      '2026-09-10', 4),
    (cls_id, 'Hindi',              'Language',      '2026-09-11', 5),
    (cls_id, 'Mathematics',        'Main Subject',  '2026-09-14', 6),
    (cls_id, 'Assamese',           'Language',      '2026-09-15', 7),
    (cls_id, 'Sanskrit',           'Language',      '2026-09-15', 8),
    (cls_id, 'Science',            'Main Subject',  '2026-09-16', 9),
    (cls_id, 'English Literature', 'Language',      '2026-09-18', 10);

  -- ============================================================
  -- Grade V-A (Cambridge) subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade V-A (Cambridge)';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Social Studies',     'Main Subject',  '2026-09-08', 1),
    (cls_id, 'Computer Science',   'Skill',         '2026-09-09', 2),
    (cls_id, 'GK',                 'Elective',      '2026-09-09', 3),
    (cls_id, 'English Language',   'Language',      '2026-09-10', 4),
    (cls_id, 'Hindi',              'Language',      '2026-09-11', 5),
    (cls_id, 'Mathematics',        'Main Subject',  '2026-09-14', 6),
    (cls_id, 'Assamese',           'Language',      '2026-09-15', 7),
    (cls_id, 'French',             'Language',      '2026-09-15', 8),
    (cls_id, 'Science',            'Main Subject',  '2026-09-16', 9),
    (cls_id, 'English Literature', 'Language',      '2026-09-18', 10);

  -- ============================================================
  -- Grade VI subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade VI';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'English Language',            'Language',      '2026-09-08', 1),
    (cls_id, 'I.T.',                        'Skill',         '2026-09-09', 2),
    (cls_id, 'G.K.',                        'Skill',         '2026-09-09', 3),
    (cls_id, 'Science',                     'Main Subject',  '2026-09-10', 4),
    (cls_id, 'Mathematics',                 'Main Subject',  '2026-09-11', 5),
    (cls_id, '2nd Language - Hindi',        'Language',      '2026-09-14', 6),
    (cls_id, '2nd Language - Assamese',     'Language',      '2026-09-14', 7),
    (cls_id, 'English Literature',          'Language',      '2026-09-15', 8),
    (cls_id, 'Social Studies',              'Main Subject',  '2026-09-16', 9),
    (cls_id, '3rd Language - Assamese',     'Language',      '2026-09-18', 10),
    (cls_id, '3rd Language - French',       'Language',      '2026-09-18', 11),
    (cls_id, '3rd Language - Sanskrit',     'Language',      '2026-09-18', 12);

  -- ============================================================
  -- Grade VII subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade VII';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Science',                     'Main Subject',  '2026-09-08', 1),
    (cls_id, 'I.T.',                        'Skill',         '2026-09-09', 2),
    (cls_id, 'G.K.',                        'Skill',         '2026-09-09', 3),
    (cls_id, '2nd Language - Hindi',        'Language',      '2026-09-10', 4),
    (cls_id, '2nd Language - Assamese',     'Language',      '2026-09-10', 5),
    (cls_id, 'Social Studies',              'Main Subject',  '2026-09-11', 6),
    (cls_id, 'English Literature',          'Language',      '2026-09-14', 7),
    (cls_id, '3rd Language - Assamese',     'Language',      '2026-09-15', 8),
    (cls_id, '3rd Language - French',       'Language',      '2026-09-15', 9),
    (cls_id, '3rd Language - Sanskrit',     'Language',      '2026-09-15', 10),
    (cls_id, 'English Language',            'Language',      '2026-09-16', 11),
    (cls_id, 'Mathematics',                 'Main Subject',  '2026-09-18', 12);

  -- ============================================================
  -- Grade VIII subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade VIII';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Mathematics',                 'Main Subject',  '2026-09-08', 1),
    (cls_id, 'I.T.',                        'Skill',         '2026-09-09', 2),
    (cls_id, 'G.K.',                        'Skill',         '2026-09-09', 3),
    (cls_id, 'English Language',            'Language',      '2026-09-10', 4),
    (cls_id, '3rd Language - Assamese',     'Language',      '2026-09-11', 5),
    (cls_id, '3rd Language - French',       'Language',      '2026-09-11', 6),
    (cls_id, '3rd Language - Sanskrit',     'Language',      '2026-09-11', 7),
    (cls_id, 'Science',                     'Main Subject',  '2026-09-14', 8),
    (cls_id, 'Social Science',              'Main Subject',  '2026-09-15', 9),
    (cls_id, '2nd Language - Hindi',        'Language',      '2026-09-16', 10),
    (cls_id, '2nd Language - Assamese',     'Language',      '2026-09-16', 11),
    (cls_id, 'English Literature',          'Language',      '2026-09-18', 12);

  -- ============================================================
  -- Grade IX subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade IX';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Social Science',              'Main Subject',  '2026-09-08', 1),
    (cls_id, 'Science',                     'Main Subject',  '2026-09-10', 2),
    (cls_id, '2nd Language - Hindi',        'Language',      '2026-09-11', 3),
    (cls_id, '2nd Language - Assamese',     'Language',      '2026-09-11', 4),
    (cls_id, '2nd Language - French',       'Language',      '2026-09-11', 5),
    (cls_id, '2nd Language - Sanskrit',     'Language',      '2026-09-11', 6),
    (cls_id, 'Painting',                    'Elective',      '2026-09-11', 7),
    (cls_id, 'Mathematics',                 'Main Subject',  '2026-09-14', 8),
    (cls_id, 'English Lang and Lit',        'Language',      '2026-09-16', 9),
    (cls_id, 'I.T. (Theory and Practical)', 'Skill',         '2026-09-18', 10);

  -- ============================================================
  -- Grade X subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade X';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Mathematics',                 'Main Subject',  '2026-09-08', 1),
    (cls_id, 'Social Science',              'Main Subject',  '2026-09-10', 2),
    (cls_id, '2nd Language - Hindi',        'Language',      '2026-09-11', 3),
    (cls_id, '2nd Language - Assamese',     'Language',      '2026-09-11', 4),
    (cls_id, '2nd Language - French',       'Language',      '2026-09-11', 5),
    (cls_id, '2nd Language - Sanskrit',     'Language',      '2026-09-11', 6),
    (cls_id, 'Painting',                    'Elective',      '2026-09-11', 7),
    (cls_id, 'Science',                     'Main Subject',  '2026-09-14', 8),
    (cls_id, 'I.T. (Theory and Practical)', 'Skill',         '2026-09-15', 9),
    (cls_id, 'A.I. (Theory and Practical)', 'Skill',         '2026-09-15', 10),
    (cls_id, 'English Lang and Lit',        'Language',      '2026-09-18', 11);

  -- ============================================================
  -- Grade XI subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade XI';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Business Studies',                          'Commerce',     '2026-09-08', 1),
    (cls_id, 'Chemistry',                                 'Science',      '2026-09-08', 2),
    (cls_id, 'Political Science',                         'Humanities',   '2026-09-08', 3),
    (cls_id, 'Biology (3rd Elective)',                    'Science',      '2026-09-10', 4),
    (cls_id, 'Computer Science (3rd Elective)',           'Technology',   '2026-09-10', 5),
    (cls_id, 'Economics (3rd Elective)',                  'Commerce',     '2026-09-10', 6),
    (cls_id, 'History (3rd Elective)',                    'Humanities',   '2026-09-10', 7),
    (cls_id, 'English Core',                              'Language',     '2026-09-11', 8),
    (cls_id, 'Accountancy',                               'Commerce',     '2026-09-14', 9),
    (cls_id, 'Sociology',                                 'Humanities',   '2026-09-14', 10),
    (cls_id, 'Physics',                                   'Science',      '2026-09-14', 11),
    (cls_id, 'Physical Education (5th Elective)',         'Elective',     '2026-09-16', 12),
    (cls_id, 'Painting (5th Elective)',                   'Elective',     '2026-09-16', 13),
    (cls_id, 'Mass Media Studies (5th Elective)',         'Elective',     '2026-09-16', 14),
    (cls_id, 'I.P (5th Elective)',                        'Technology',   '2026-09-16', 15),
    (cls_id, 'Entrepreneurship (5th Elective)',           'Commerce',     '2026-09-16', 16),
    (cls_id, 'Maths Core (4th Elective)',                 'Mathematics',  '2026-09-18', 17),
    (cls_id, 'Applied Maths (4th Elective)',              'Mathematics',  '2026-09-18', 18),
    (cls_id, 'Psychology (4th Elective)',                 'Humanities',   '2026-09-18', 19),
    (cls_id, 'Geography (4th Elective)',                  'Humanities',   '2026-09-18', 20),
    (cls_id, 'Entrepreneurship (4th Elective)',           'Commerce',     '2026-09-18', 21),
    (cls_id, 'Physical Education (4th Elective)',         'Elective',     '2026-09-18', 22);

  -- ============================================================
  -- Grade XII subjects
  -- ============================================================
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade XII';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Accountancy',                                  'Commerce',     '2026-09-08', 1),
    (cls_id, 'History',                                      'Humanities',   '2026-09-08', 2),
    (cls_id, 'Physics',                                      'Science',      '2026-09-08', 3),
    (cls_id, 'Biology (3rd Elective)',                       'Science',      '2026-09-10', 4),
    (cls_id, 'Computer Science (3rd Elective)',              'Technology',   '2026-09-10', 5),
    (cls_id, 'Economics (3rd Elective)',                     'Commerce',     '2026-09-10', 6),
    (cls_id, 'Sociology (3rd Elective)',                     'Humanities',   '2026-09-10', 7),
    (cls_id, 'English Core',                                 'Language',     '2026-09-11', 8),
    (cls_id, 'Maths Core (4th Elective)',                    'Mathematics',  '2026-09-14', 9),
    (cls_id, 'Applied Maths (4th Elective)',                 'Mathematics',  '2026-09-14', 10),
    (cls_id, 'Psychology (4th Elective)',                    'Humanities',   '2026-09-14', 11),
    (cls_id, 'Geography (4th Elective)',                     'Humanities',   '2026-09-14', 12),
    (cls_id, 'Entrepreneurship (4th Elective)',              'Commerce',     '2026-09-14', 13),
    (cls_id, 'Physical Education (5th Elective)',            'Elective',     '2026-09-15', 14),
    (cls_id, 'Painting (5th Elective)',                      'Elective',     '2026-09-15', 15),
    (cls_id, 'Mass Media Studies (5th Elective)',            'Elective',     '2026-09-15', 16),
    (cls_id, 'I.P (5th Elective)',                           'Technology',   '2026-09-15', 17),
    (cls_id, 'Applied Maths (With EP)',                      'Mathematics',  '2026-09-16', 18),
    (cls_id, 'Core Maths (With EP)',                         'Mathematics',  '2026-09-16', 19),
    (cls_id, 'Sociology (With ECO)',                         'Humanities',   '2026-09-16', 20),
    (cls_id, 'Computer Science (With ECO / CWSN)',           'Technology',   '2026-09-16', 21),
    (cls_id, 'Business Studies',                             'Commerce',     '2026-09-18', 22),
    (cls_id, 'Chemistry',                                    'Science',      '2026-09-18', 23),
    (cls_id, 'Political Science',                            'Humanities',   '2026-09-18', 24);

  RAISE NOTICE 'RGS seed data inserted successfully.';
END $$;
