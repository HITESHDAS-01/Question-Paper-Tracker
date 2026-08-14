-- ============================================================
-- Update class labels to 'Grade X' format
-- Maps: '3' → 'Grade III', '3A' → 'Grade III-A (Cambridge)', etc.
-- ============================================================

UPDATE classes SET label = 'Grade III' WHERE label = '3';
UPDATE classes SET label = 'Grade III-A (Cambridge)' WHERE label = '3A';
UPDATE classes SET label = 'Grade IV' WHERE label = '4';
UPDATE classes SET label = 'Grade V' WHERE label = '5';
UPDATE classes SET label = 'Grade V-A (Cambridge)' WHERE label = '5A';
UPDATE classes SET label = 'Grade VI' WHERE label = '6';
UPDATE classes SET label = 'Grade VII' WHERE label = '7';
UPDATE classes SET label = 'Grade VIII' WHERE label = '8';
UPDATE classes SET label = 'Grade IX' WHERE label = '9';
UPDATE classes SET label = 'Grade X' WHERE label = '10';
UPDATE classes SET label = 'Grade XI' WHERE label = '11';
UPDATE classes SET label = 'Grade XII' WHERE label = '12';
