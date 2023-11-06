alter table slugpost
add constraint unique_slug_postid unique (slug, postid);