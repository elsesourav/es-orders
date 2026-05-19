-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.base_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'shared'::"StatusEnum",
  item_name text NOT NULL,
  item_sku USER-DEFINED NOT NULL,
  created_by uuid,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  updated_by uuid,
  deleted_at timestamp without time zone,
  CONSTRAINT base_items_pkey PRIMARY KEY (id),
  CONSTRAINT base_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT base_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vertical_id uuid NOT NULL,
  categorySku USER-DEFINED NOT NULL,
  label text,
  status USER-DEFINED NOT NULL DEFAULT 'shared'::"StatusEnum",
  created_by uuid,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  updated_by uuid,
  deleted_at timestamp without time zone,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_vertical_id_fkey FOREIGN KEY (vertical_id) REFERENCES public.verticals(id),
  CONSTRAINT categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.group_items (
  group_id uuid NOT NULL,
  item_id uuid NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid,
  CONSTRAINT group_items_pkey PRIMARY KEY (group_id, item_id),
  CONSTRAINT group_items_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT group_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id)
);
CREATE TABLE public.group_user_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  product_id text NOT NULL,
  listing_id text,
  sku_id text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT group_user_products_pkey PRIMARY KEY (id),
  CONSTRAINT group_user_products_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT group_user_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  label text,
  status USER-DEFINED NOT NULL DEFAULT 'shared'::"StatusEnum",
  hsn integer,
  tax_code USER-DEFINED NOT NULL DEFAULT 'Select One'::"TaxCodeEnum",
  height_cm numeric,
  length_cm numeric,
  weight_kg numeric,
  breadth_cm numeric,
  packaging_cost numeric,
  final_price_over_300 boolean NOT NULL DEFAULT false,
  min_quantity_in_piece integer,
  vertical_id uuid,
  category_id uuid,
  created_by uuid NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  updated_by uuid,
  deleted_at timestamp without time zone,
  CONSTRAINT groups_pkey PRIMARY KEY (id),
  CONSTRAINT groups_vertical_id_fkey FOREIGN KEY (vertical_id) REFERENCES public.verticals(id),
  CONSTRAINT groups_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.item_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  user_id uuid NOT NULL,
  operation text NOT NULL DEFAULT 'UPDATE'::text CHECK (operation = 'UPDATE'::text),
  previous_data jsonb NOT NULL,
  next_data jsonb NOT NULL,
  changed_fields jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT item_history_pkey PRIMARY KEY (id),
  CONSTRAINT item_history_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id),
  CONSTRAINT item_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  label text,
  status USER-DEFINED NOT NULL DEFAULT 'shared'::"StatusEnum",
  vertical_id uuid,
  category_id uuid NOT NULL,
  created_by uuid,
  price numeric,
  quantity_per_kg numeric,
  self_life integer,
  item_sku USER-DEFINED NOT NULL,
  increment_per_rupee numeric,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  updated_by uuid,
  deleted_at timestamp without time zone,
  CONSTRAINT items_pkey PRIMARY KEY (id),
  CONSTRAINT items_vertical_id_fkey FOREIGN KEY (vertical_id) REFERENCES public.verticals(id),
  CONSTRAINT items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.listing_template (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'shared'::"StatusEnum",
  group_id uuid,
  prompt_id uuid,
  name text NOT NULL,
  color text,
  json jsonb,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  updated_by uuid,
  deleted_at timestamp without time zone,
  CONSTRAINT listing_template_pkey PRIMARY KEY (id),
  CONSTRAINT listing_template_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT listing_template_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT listing_template_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.prompt(id)
);
CREATE TABLE public.map_skus (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  old_sku USER-DEFINED NOT NULL,
  new_sku USER-DEFINED NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  updated_by uuid,
  deleted_at timestamp without time zone,
  CONSTRAINT map_skus_pkey PRIMARY KEY (id),
  CONSTRAINT map_skus_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.orders_states (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'shared'::"StatusEnum",
  state_data jsonb NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  updated_by uuid,
  deleted_at timestamp without time zone,
  CONSTRAINT orders_states_pkey PRIMARY KEY (id),
  CONSTRAINT orders_states_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.prompt (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'shared'::"StatusEnum",
  name text NOT NULL,
  value text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  updated_by uuid,
  deleted_at timestamp without time zone,
  CONSTRAINT prompt_pkey PRIMARY KEY (id),
  CONSTRAINT prompt_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.shared_access_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  shared_with_user_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  member_access_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT shared_access_users_pkey PRIMARY KEY (id),
  CONSTRAINT shared_access_users_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id),
  CONSTRAINT shared_access_users_shared_with_user_id_fkey FOREIGN KEY (shared_with_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  username text NOT NULL,
  password text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login timestamp without time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.verticals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  verticalSku USER-DEFINED NOT NULL,
  label text,
  status USER-DEFINED NOT NULL DEFAULT 'shared'::"StatusEnum",
  created_by uuid,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  updated_by uuid,
  deleted_at timestamp without time zone,
  CONSTRAINT verticals_pkey PRIMARY KEY (id),
  CONSTRAINT verticals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);