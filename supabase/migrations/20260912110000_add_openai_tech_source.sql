insert into "public"."tech_sources" (name, slug, site_url, feed_url) values
  ('OpenAI News', 'openai', 'https://openai.com/news', 'https://openai.com/news/rss.xml')
on conflict (slug) do nothing;
