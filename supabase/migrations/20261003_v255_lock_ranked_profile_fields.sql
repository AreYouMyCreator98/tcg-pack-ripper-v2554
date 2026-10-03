-- Keep server-ranked public fields battle-derived.
revoke update on table public.mp_profiles from authenticated;
grant update(display_name,profile_frame_id,avatar_data,banner_title,banner_style,banner_badges,banner_show_record,last_seen,updated_at) on table public.mp_profiles to authenticated;
