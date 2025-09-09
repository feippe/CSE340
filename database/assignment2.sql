-- Assignment 2 --

-- Task One --

-- 1. INSERT ACCOUNT
INSERT INTO account
(account_firstname, account_lastname, account_email, account_password)
VALUES
('Tony','Stark','tony@starkent.com','Iam1ronM@n');

-- 2. MODIFY ACCOUNT TYPE
UPDATE account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';

-- 3. DELETE ACCOUNT
DELETE FROM account
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';

-- 4. MODIFY THE "GM Hummer"
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'the small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5. INNER JOIN
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory AS i
INNER JOIN public.classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6. UPDATE ALL RECORDS
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'), inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
