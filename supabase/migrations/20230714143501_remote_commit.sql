alter table "storage"."objects" add constraint "objects_owner_fkey" FOREIGN KEY (owner) REFERENCES auth.users(id) not valid;

alter table "storage"."objects" validate constraint "objects_owner_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION storage.extension(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return split_part(_filename, '.', 2);
END
$function$
;

CREATE OR REPLACE FUNCTION storage.filename(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.foldername(name text)
 RETURNS text[]
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$function$
;

create policy "Allow any user to see images rziwj7_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'blogger-images'::text));


create policy "Allow auth users to manipulate own folder rziwj7_1"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'blogger-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Allow auth users to manipulate own folder rziwj7_2"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'blogger-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Allow auth users to manipulate own folder rziwj7_3"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'blogger-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Give users access to own folder 1eqf8uk_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'blog-files'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Give users access to own folder 1eqf8uk_1"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'blog-files'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Give users access to own folder 1eqf8uk_2"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'blog-files'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "allow any users to see files in a folder 1eqf8uk_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'blog-files'::text));



