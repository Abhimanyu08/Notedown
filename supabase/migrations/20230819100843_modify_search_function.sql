CREATE OR REPLACE FUNCTION "public"."search"("user_id" "text", "search_term" "text") RETURNS TABLE("id" bigint, "created_by" "uuid", "title" "text", "description" "text", "published" boolean, "created_at" "text", "published_on" "text", "language" character varying, "upvote_count" bigint, "author" character varying, "timestamp" "text")
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        RETURN QUERY
            SELECT posts.id, posts.created_by, posts.title, posts.description, posts.published, posts.created_at::text, posts.published_on::text, 
            posts.language, posts.upvote_count,
            (select bloggers.name from bloggers where bloggers.id = posts.created_by) as author, 
            posts.timestamp
            FROM posts , to_tsquery(search_term) query
            where posts.created_by = user_id::uuid and query @@ posts.search_index_col;
    END;
$$;