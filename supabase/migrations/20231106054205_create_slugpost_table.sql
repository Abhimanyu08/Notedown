create table slugpost (
  id serial primary key,
  slug text not null,
  postId bigint not null references posts(id)
);
