ALTER TABLE public.bloggers
ADD username text;


ALTER TABLE public.bloggers
ADD UNIQUE (username)