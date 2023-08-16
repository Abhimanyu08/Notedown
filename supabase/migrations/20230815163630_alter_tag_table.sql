alter table tags
add created_by uuid references public.bloggers(id) on delete cascade;

alter table tags
add constraint unique_tag_created_by unique (tag_name, created_by);

