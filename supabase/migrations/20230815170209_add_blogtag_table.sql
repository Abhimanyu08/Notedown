create table 
blogtag (
    blog_id bigint references posts(id) on delete cascade,
    tag_id bigint references tags(id) on delete cascade
);