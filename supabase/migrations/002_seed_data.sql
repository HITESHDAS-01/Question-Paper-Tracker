-- ============================================================
-- DEMO SEED DATA (optional)
-- ============================================================
-- This file is for DEMO / PREVIEW purposes only.
-- It populates a sample tracker with grades III-XII and
-- subjects so new users can see how the app works.
--
-- HOW TO USE:
--   1. Sign up as a school (e.g. "Demo School")
--   2. Note the school slug (e.g. "demo-school")
--   3. Update @target_slug below, then run this migration
--
-- DO NOT run this in production for real schools.
-- Each school creates their own trackers via the app UI.
-- ============================================================

DO $$
DECLARE
  target_slug text := 'demo-school';  -- <-- CHANGE THIS to your school's slug
  target_school_id uuid;
  tracker_id uuid;
  cls_id uuid;
BEGIN
  -- Find school by slug
  SELECT id INTO target_school_id FROM schools WHERE slug = target_slug;

  IF target_school_id IS NULL THEN
    RAISE NOTICE 'School with slug "%" not found. Skipping demo seed.', target_slug;
    RETURN;
  END IF;

  -- Create a demo tracker
  INSERT INTO trackers (school_id, name, subtitle, note_banner)
  VALUES (
    target_school_id,
    'Demo Tracker',
    'Sample Half Yearly Examination',
    'This is demo data. Delete this tracker and create your own.'
  )
  RETURNING id INTO tracker_id;

  -- Create classes
  INSERT INTO classes (tracker_id, label, track_items, sort_order) VALUES
    (tracker_id, 'Grade VI',   '["qp","bp","ms","edited","proofread","corrected","final"]', 1),
    (tracker_id, 'Grade VII',  '["qp","bp","ms","edited","proofread","corrected","final"]', 2),
    (tracker_id, 'Grade VIII', '["qp","bp","ms","edited","proofread","corrected","final"]', 3),
    (tracker_id, 'Grade IX',   '["qp","bp","ms","edited","proofread","corrected","final"]', 4),
    (tracker_id, 'Grade X',    '["qp","bp","ms","edited","proofread","corrected","final"]', 5);

  -- Grade VI subjects
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade VI';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'English Language',     'Language',      '2026-09-08', 1),
    (cls_id, 'Mathematics',          'Main Subject',  '2026-09-10', 2),
    (cls_id, 'Science',              'Main Subject',  '2026-09-12', 3),
    (cls_id, 'Social Studies',       'Main Subject',  '2026-09-14', 4),
    (cls_id, '2nd Language - Hindi', 'Language',      '2026-09-16', 5);

  -- Grade VII subjects
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade VII';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Science',              'Main Subject',  '2026-09-08', 1),
    (cls_id, 'Mathematics',          'Main Subject',  '2026-09-10', 2),
    (cls_id, 'English Literature',   'Language',      '2026-09-12', 3),
    (cls_id, 'Social Studies',       'Main Subject',  '2026-09-14', 4),
    (cls_id, '2nd Language - Hindi', 'Language',      '2026-09-16', 5);

  -- Grade VIII subjects
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade VIII';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Mathematics',          'Main Subject',  '2026-09-08', 1),
    (cls_id, 'Science',              'Main Subject',  '2026-09-10', 2),
    (cls_id, 'English Language',     'Language',      '2026-09-12', 3),
    (cls_id, 'Social Science',       'Main Subject',  '2026-09-14', 4),
    (cls_id, '2nd Language - Hindi', 'Language',      '2026-09-16', 5);

  -- Grade IX subjects
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade IX';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Social Science',       'Main Subject',  '2026-09-08', 1),
    (cls_id, 'Science',              'Main Subject',  '2026-09-10', 2),
    (cls_id, 'Mathematics',          'Main Subject',  '2026-09-12', 3),
    (cls_id, 'English Lang and Lit', 'Language',      '2026-09-14', 4),
    (cls_id, '2nd Language - Hindi', 'Language',      '2026-09-16', 5);

  -- Grade X subjects
  SELECT id INTO cls_id FROM classes WHERE tracker_id = tracker_id AND label = 'Grade X';
  INSERT INTO subjects (class_id, name, category, exam_date, sort_order) VALUES
    (cls_id, 'Mathematics',          'Main Subject',  '2026-09-08', 1),
    (cls_id, 'Science',              'Main Subject',  '2026-09-10', 2),
    (cls_id, 'Social Science',       'Main Subject',  '2026-09-12', 3),
    (cls_id, 'English Lang and Lit', 'Language',      '2026-09-14', 4),
    (cls_id, '2nd Language - Hindi', 'Language',      '2026-09-16', 5);

  RAISE NOTICE 'Demo seed data inserted for school "%".', target_slug;
END $$;
