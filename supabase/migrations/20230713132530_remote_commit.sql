
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER SCHEMA "public" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE FUNCTION "public"."add_blogger_from_auth"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into public.bloggers(id)
  values (new.id);
  return new;
end;$$;

ALTER FUNCTION "public"."add_blogger_from_auth"() OWNER TO "postgres";

CREATE FUNCTION "public"."add_upvotes_on_upvote"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update public.posts
  set upvote_count = (select upvote_count FROM posts where
  public.posts.id = new.post_id) + 1
  where posts.id = new.post_id;
  return new;
end;$$;

ALTER FUNCTION "public"."add_upvotes_on_upvote"() OWNER TO "postgres";

CREATE FUNCTION "public"."generate_tsvector_on_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
if new.title <> coalesce(old.title, '') or 
new.description <> coalesce(old.description, '') or 
new.language <> coalesce(old.language, '')
then
update public.posts
set search_index_col = to_tsvector('english',
coalesce(new.title, '') || ' ' || coalesce(new.description, '')
|| ' ' || coalesce(new.language, '') || ' ' ||
coalesce((select name from bloggers where bloggers.id = new.created_by),'')
)
where posts.id = new.id;
end if;
return new;
end;$$;

ALTER FUNCTION "public"."generate_tsvector_on_insert"() OWNER TO "postgres";

CREATE FUNCTION "public"."private_search"("user_id" "text", "search_term" "text", "cursor" double precision) RETURNS TABLE("id" bigint, "created_by" "uuid", "title" "text", "description" "text", "published" boolean, "created_at" "text", "published_on" "text", "language" character varying, "upvote_count" bigint, "author" character varying, "search_rank" double precision)
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        RETURN QUERY
            SELECT posts.id, posts.created_by, posts.title, posts.description, posts.published, posts.created_at::text, posts.published_on::text, 
            posts.language, posts.upvote_count,
            (select bloggers.name from bloggers where bloggers.id = posts.created_by) as author, 
            ts_rank(posts.search_index_col, query)::float AS search_rank
            FROM posts , to_tsquery(search_term) query
            where posts.created_by = user_id::uuid and query @@ posts.search_index_col and ts_rank(search_index_col, query) < coalesce(cursor, 1)
            order by search_rank desc;
    END;
$$;

ALTER FUNCTION "public"."private_search"("user_id" "text", "search_term" "text", "cursor" double precision) OWNER TO "postgres";

CREATE FUNCTION "public"."public_search"("search_term" "text", "cursor" double precision) RETURNS TABLE("id" bigint, "created_by" "uuid", "title" "text", "description" "text", "published" boolean, "created_at" "text", "published_on" "text", "language" character varying, "upvote_count" bigint, "author" character varying, "search_rank" double precision)
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        RETURN QUERY
            SELECT posts.id, posts.created_by, posts.title, posts.description, posts.published, posts.created_at::text, posts.published_on::text, 
            posts.language, posts.upvote_count,
            (select bloggers.name from bloggers where bloggers.id = posts.created_by) as author, 
            ts_rank(posts.search_index_col, query)::float AS search_rank
            FROM posts , to_tsquery(search_term) query
            where query @@ posts.search_index_col and ts_rank(search_index_col, query) < coalesce(cursor, 1)
            order by search_rank desc;
    END;
$$;

ALTER FUNCTION "public"."public_search"("search_term" "text", "cursor" double precision) OWNER TO "postgres";

CREATE FUNCTION "public"."ranked_search_private"("user_id" "text", "search_term" "text", "cursor" double precision) RETURNS TABLE("id" bigint, "created_by" "uuid", "title" character varying, "description" character varying, "published" boolean, "created_at" "text", "published_on" "text", "language" character varying, "upvote_count" bigint, "author" character varying, "search_rank" double precision)
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        RETURN QUERY
            SELECT posts.id, posts.created_by, posts.title, posts.description, posts.published, posts.created_at::text, posts.published_on::text, 
            posts.language, posts.upvote_count,
            (select bloggers.name from bloggers where bloggers.id = posts.created_by) as author, 
            ts_rank(posts.search_index_col, query)::float AS search_rank
            FROM posts , to_tsquery(search_term) query
            where posts.created_by = user_id::uuid and query @@ posts.search_index_col and ts_rank(search_index_col, query) < coalesce(cursor, 1)
            order by search_rank desc 
            limit 4;
    END;
$$;

ALTER FUNCTION "public"."ranked_search_private"("user_id" "text", "search_term" "text", "cursor" double precision) OWNER TO "postgres";

CREATE FUNCTION "public"."ranked_search_public"("search_term" "text", "cursor" double precision) RETURNS TABLE("id" bigint, "created_by" "uuid", "title" character varying, "description" character varying, "published" boolean, "created_at" "text", "published_on" "text", "language" character varying, "upvote_count" bigint, "author" character varying, "search_rank" double precision)
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        RETURN QUERY
            SELECT posts.id, posts.created_by, posts.title, posts.description, posts.published, posts.created_at::text, posts.published_on::text, 
            posts.language, posts.upvote_count,
            (select bloggers.name from bloggers where bloggers.id = posts.created_by) as author, 
            ts_rank(posts.search_index_col, query)::float AS search_rank
            FROM posts , to_tsquery(search_term) query
            where query @@ posts.search_index_col and ts_rank(search_index_col, query) < coalesce(cursor, 1)
            order by search_rank desc 
            limit 4;
    END;
$$;

ALTER FUNCTION "public"."ranked_search_public"("search_term" "text", "cursor" double precision) OWNER TO "postgres";

CREATE FUNCTION "public"."search_upvotes"("user_id" "text", "search_term" "text", "cursor" double precision) RETURNS TABLE("id" bigint, "created_by" "uuid", "title" "text", "description" "text", "published" boolean, "published_on" "text", "language" character varying, "upvote_count" bigint, "author" character varying, "search_rank" double precision)
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        RETURN QUERY
            SELECT posts.id, posts.created_by, posts.title, posts.description, posts.published, posts.published_on::text, posts.language, posts.upvote_count,
            (select bloggers.name from bloggers where bloggers.id = posts.created_by) as author,
            ts_rank(posts.search_index_col, query)::float AS search_rank
            FROM to_tsquery(search_term) query, posts join (select post_id from upvotes where upvotes.upvoter = user_id::uuid) as upvotes_by_user
            on posts.id = upvotes_by_user.post_id
            where query @@ posts.search_index_col and ts_rank(posts.search_index_col, query)::float < coalesce(cursor, 1)
            order by search_rank desc
            LIMIT 4;
    END;
$$;

ALTER FUNCTION "public"."search_upvotes"("user_id" "text", "search_term" "text", "cursor" double precision) OWNER TO "postgres";

CREATE FUNCTION "public"."search_upvotes_of_user"("user_id" "text", "search_term" "text", "cursor" double precision) RETURNS TABLE("id" bigint, "created_by" "uuid", "title" character varying, "description" character varying, "published" boolean, "published_on" "text", "language" character varying, "upvote_count" bigint, "author" character varying, "search_rank" double precision)
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        RETURN QUERY
            SELECT posts.id, posts.created_by, posts.title, posts.description, posts.published, posts.published_on::text, posts.language, posts.upvote_count,
            (select bloggers.name from bloggers where bloggers.id = posts.created_by) as author,
            ts_rank(posts.search_index_col, query)::float AS search_rank
            FROM to_tsquery(search_term) query, posts join (select post_id from upvotes where upvotes.upvoter = user_id::uuid) as upvotes_by_user
            on posts.id = upvotes_by_user.post_id
            where query @@ posts.search_index_col and ts_rank(posts.search_index_col, query)::float < coalesce(cursor, 1)
            order by search_rank desc
            LIMIT 4;
    END;
$$;

ALTER FUNCTION "public"."search_upvotes_of_user"("user_id" "text", "search_term" "text", "cursor" double precision) OWNER TO "postgres";

CREATE FUNCTION "public"."subtract_upvote_on_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
update public.posts
set upvote_count = (select upvote_count FROM public.posts where
posts.id = old.post_id) - 1
where posts.id = old.post_id;
return old;
end$$;

ALTER FUNCTION "public"."subtract_upvote_on_delete"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE "public"."bloggers" (
    "created_at" timestamp with time zone DEFAULT "now"(),
    "id" "uuid" NOT NULL,
    "name" character varying,
    "avatar_url" character varying,
    "about" character varying(1000) DEFAULT ''::character varying,
    CONSTRAINT "bloggers_about_check" CHECK (("length"(("about")::"text") < 1000))
);

ALTER TABLE "public"."bloggers" OWNER TO "postgres";

CREATE TABLE "public"."posts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "filename" character varying,
    "title" "text" NOT NULL,
    "description" "text",
    "language" character varying DEFAULT ''::character varying,
    "published" boolean DEFAULT false NOT NULL,
    "published_on" character varying,
    "image_folder" character varying,
    "upvote_count" bigint DEFAULT '0'::bigint NOT NULL,
    "search_index_col" "tsvector",
    CONSTRAINT "posts_description_check" CHECK (("length"("description") < 500)),
    CONSTRAINT "posts_title_check" CHECK (("length"("title") < 200))
);

ALTER TABLE "public"."posts" OWNER TO "postgres";

ALTER TABLE "public"."posts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."upvotes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "upvoter" "uuid" NOT NULL,
    "post_id" bigint NOT NULL
);

ALTER TABLE "public"."upvotes" OWNER TO "postgres";

ALTER TABLE "public"."upvotes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."upvotes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."bloggers"
    ADD CONSTRAINT "bloggers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_filename_key" UNIQUE ("filename");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_image_folder_key" UNIQUE ("image_folder");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."upvotes"
    ADD CONSTRAINT "upvotes_pkey" PRIMARY KEY ("id");

CREATE INDEX "textsearch_idx" ON "public"."posts" USING "gin" ("search_index_col");

CREATE TRIGGER "add_upvote" AFTER INSERT ON "public"."upvotes" FOR EACH ROW EXECUTE FUNCTION "public"."add_upvotes_on_upvote"();

CREATE TRIGGER "set_tsvector_col" AFTER INSERT OR UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."generate_tsvector_on_insert"();

CREATE TRIGGER "subtract_upvote" AFTER DELETE ON "public"."upvotes" FOR EACH ROW EXECUTE FUNCTION "public"."subtract_upvote_on_delete"();

ALTER TABLE ONLY "public"."bloggers"
    ADD CONSTRAINT "bloggers_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."bloggers"("id");

ALTER TABLE ONLY "public"."upvotes"
    ADD CONSTRAINT "upvotes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."upvotes"
    ADD CONSTRAINT "upvotes_upvoter_fkey" FOREIGN KEY ("upvoter") REFERENCES "public"."bloggers"("id") ON DELETE CASCADE;

CREATE POLICY "Allow only owner to update the post" ON "public"."posts" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "created_by")) WITH CHECK (("auth"."uid"() = "created_by"));

CREATE POLICY "Allow owner to see all his posts" ON "public"."posts" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "created_by"));

CREATE POLICY "Allow owner to update his info" ON "public"."bloggers" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));

CREATE POLICY "Enable anyone to see all users" ON "public"."bloggers" FOR SELECT USING (true);

CREATE POLICY "Enable delete for users based on user_id" ON "public"."posts" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "created_by"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK (true);

ALTER TABLE "public"."bloggers" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enable anyone to see published posts" ON "public"."posts" FOR SELECT USING ("published");

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."add_blogger_from_auth"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_blogger_from_auth"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_blogger_from_auth"() TO "service_role";

GRANT ALL ON FUNCTION "public"."add_upvotes_on_upvote"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_upvotes_on_upvote"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_upvotes_on_upvote"() TO "service_role";

GRANT ALL ON FUNCTION "public"."generate_tsvector_on_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_tsvector_on_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_tsvector_on_insert"() TO "service_role";

GRANT ALL ON FUNCTION "public"."private_search"("user_id" "text", "search_term" "text", "cursor" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."private_search"("user_id" "text", "search_term" "text", "cursor" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."private_search"("user_id" "text", "search_term" "text", "cursor" double precision) TO "service_role";

GRANT ALL ON FUNCTION "public"."public_search"("search_term" "text", "cursor" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."public_search"("search_term" "text", "cursor" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."public_search"("search_term" "text", "cursor" double precision) TO "service_role";

GRANT ALL ON FUNCTION "public"."ranked_search_private"("user_id" "text", "search_term" "text", "cursor" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."ranked_search_private"("user_id" "text", "search_term" "text", "cursor" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."ranked_search_private"("user_id" "text", "search_term" "text", "cursor" double precision) TO "service_role";

GRANT ALL ON FUNCTION "public"."ranked_search_public"("search_term" "text", "cursor" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."ranked_search_public"("search_term" "text", "cursor" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."ranked_search_public"("search_term" "text", "cursor" double precision) TO "service_role";

GRANT ALL ON FUNCTION "public"."search_upvotes"("user_id" "text", "search_term" "text", "cursor" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."search_upvotes"("user_id" "text", "search_term" "text", "cursor" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_upvotes"("user_id" "text", "search_term" "text", "cursor" double precision) TO "service_role";

GRANT ALL ON FUNCTION "public"."search_upvotes_of_user"("user_id" "text", "search_term" "text", "cursor" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."search_upvotes_of_user"("user_id" "text", "search_term" "text", "cursor" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_upvotes_of_user"("user_id" "text", "search_term" "text", "cursor" double precision) TO "service_role";

GRANT ALL ON FUNCTION "public"."subtract_upvote_on_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."subtract_upvote_on_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."subtract_upvote_on_delete"() TO "service_role";

GRANT ALL ON TABLE "public"."bloggers" TO "anon";
GRANT ALL ON TABLE "public"."bloggers" TO "authenticated";
GRANT ALL ON TABLE "public"."bloggers" TO "service_role";

GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";

GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."upvotes" TO "anon";
GRANT ALL ON TABLE "public"."upvotes" TO "authenticated";
GRANT ALL ON TABLE "public"."upvotes" TO "service_role";

GRANT ALL ON SEQUENCE "public"."upvotes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."upvotes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."upvotes_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
